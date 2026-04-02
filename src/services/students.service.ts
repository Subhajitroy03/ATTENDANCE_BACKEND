import { StatusCodes } from "http-status-codes";
import { and, asc, desc, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { departments, sections, students, teachers } from "../db/schema.js";
import { ApiError } from "../utils/ApiError.js";
import { assertAotEduEmail, normalizeEmail } from "../utils/email.js";
import { generateUserTokenPair, verifyUserRefreshToken } from "../utils/jwt.js";
import {
	buildSearch,
	buildWhere,
	parseBoolean,
	parsePagination,
	parseString,
	type PaginationInput,
} from "../utils/listQuery.js";

export interface CreateStudentInput {
	studentId: string;
	name: string;
	email: string;
	sectionId: string;
	photo?: string;
}

export interface UpdateStudentInput {
	studentId?: string;
	name?: string;
	email?: string;
	sectionId?: string;
	photo?: string;
	status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "GRADUATED";
	verified?: boolean;
}

export interface ListStudentsQuery extends PaginationInput {
	q?: unknown;
	sectionId?: unknown;
	status?: unknown;
	verified?: unknown;
}

export interface LoginStudentInput {
	studentId: string;
	email: string;
}

const studentSelect = {
	id: students.id,
	studentId: students.studentId,
	name: students.name,
	email: students.email,
	sectionId: students.sectionId,
	photo: students.photo,
	password: students.password,
	refreshToken: students.refreshToken,
	status: students.status,
	verified: students.verified,
	role: students.role,
	createdAt: students.createdAt,
	updatedAt: students.updatedAt,
};

const sectionSelect = {
	id: sections.id,
	departmentId: sections.departmentId,
	semester: sections.semester,
	section: sections.section,
	classTeacherId: sections.classTeacherId,
	name: sections.name,
	capacity: sections.capacity,
	createdAt: sections.createdAt,
};

const departmentSelect = {
	id: departments.id,
	name: departments.name,
	code: departments.code,
	createdAt: departments.createdAt,
};

const teacherSelect = {
	id: teachers.id,
	employeeId: teachers.employeeId,
	name: teachers.name,
	email: teachers.email,
	abbreviation: teachers.abbreviation,
	phone: teachers.phone,
	photo: teachers.photo,
	departmentId: teachers.departmentId,
	status: teachers.status,
	role: teachers.role,
	verified: teachers.verified,
	createdAt: teachers.createdAt,
	updatedAt: teachers.updatedAt,
};

async function getStudentOrThrow(id: string) {
	const rows = await db
		.select({
			student: studentSelect,
			section: sectionSelect,
			sectionDepartment: departmentSelect,
			sectionClassTeacher: teacherSelect,
		})
		.from(students)
		.innerJoin(sections, eq(students.sectionId, sections.id))
		.innerJoin(departments, eq(sections.departmentId, departments.id))
		.leftJoin(teachers, eq(sections.classTeacherId, teachers.id))
		.where(eq(students.id, id))
		.limit(1);
	if (!rows.length) throw new ApiError(StatusCodes.NOT_FOUND, "Student not found");

	const row = rows[0];
	return {
		...row.student,
		section: {
			...row.section,
			department: row.sectionDepartment,
			classTeacher: row.sectionClassTeacher,
		},
	};
}

async function createStudent(input: CreateStudentInput) {
	assertAotEduEmail(input.email);
	const [created] = await db
		.insert(students)
		.values({
			studentId: input.studentId,
			name: input.name,
			email: normalizeEmail(input.email),
			sectionId: input.sectionId,
			photo: input.photo,
		})
		.returning();

	return created;
}

async function loginStudent(input: LoginStudentInput) {
	assertAotEduEmail(input.email);
	const email = normalizeEmail(input.email);

	const rows = await db
		.select({
			id: students.id,
			studentId: students.studentId,
			name: students.name,
			email: students.email,
			sectionId: students.sectionId,
			photo: students.photo,
			status: students.status,
			verified: students.verified,
			role: students.role,
			createdAt: students.createdAt,
			updatedAt: students.updatedAt,
		})
		.from(students)
		.where(and(eq(students.email, email), eq(students.studentId, input.studentId)))
		.limit(1);

	if (!rows.length) {
		throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
	}

	const student = rows[0];
	if (student.status !== "ACTIVE") {
		throw new ApiError(StatusCodes.FORBIDDEN, "Student account is not active");
	}
	if (!student.verified) {
		throw new ApiError(StatusCodes.FORBIDDEN, "Student account is not verified yet");
	}

	const tokens = generateUserTokenPair({
		id: student.id,
		email: student.email,
		role: "student",
	});

	// Save refresh token to database
	await db
		.update(students)
		.set({ refreshToken: tokens.refreshToken, updatedAt: new Date() })
		.where(eq(students.id, student.id));

	return {
		student,
		...tokens,
	};
}

async function getStudents(query: ListStudentsQuery) {
	const { limit, offset, order } = parsePagination(query);
	const sectionId = parseString(query.sectionId);
	const status = parseString(query.status);
	const verified = parseBoolean(query.verified);
	const where = buildWhere(
		buildSearch(query.q, students.name, students.email, students.studentId),
		sectionId ? eq(students.sectionId, sectionId) : undefined,
		status ? eq(students.status, status as any) : undefined,
		verified === undefined ? undefined : eq(students.verified, verified)
	);

	return await db
		.select({
			student: studentSelect,
			section: sectionSelect,
			sectionDepartment: departmentSelect,
			sectionClassTeacher: teacherSelect,
		})
		.from(students)
		.innerJoin(sections, eq(students.sectionId, sections.id))
		.innerJoin(departments, eq(sections.departmentId, departments.id))
		.leftJoin(teachers, eq(sections.classTeacherId, teachers.id))
		.where(where)
		.orderBy(order === "asc" ? asc(students.createdAt) : desc(students.createdAt))
		.limit(limit)
		.offset(offset)
		.then((rows) =>
			rows.map((row) => ({
				...row.student,
				section: {
					...row.section,
					department: row.sectionDepartment,
					classTeacher: row.sectionClassTeacher,
				},
			}))
		);
}

async function getStudentById(id: string) {
	return await getStudentOrThrow(id);
}

async function updateStudent(id: string, input: UpdateStudentInput) {
	await getStudentOrThrow(id);
	const patch: Partial<typeof students.$inferInsert> = {};

	if (input.studentId !== undefined) patch.studentId = input.studentId;
	if (input.name !== undefined) patch.name = input.name;
	if (input.email !== undefined) {
		assertAotEduEmail(input.email);
		patch.email = normalizeEmail(input.email);
	}
	if (input.sectionId !== undefined) patch.sectionId = input.sectionId;
	if (input.photo !== undefined) patch.photo = input.photo;
	if (input.status !== undefined) patch.status = input.status as any;
	if (input.verified !== undefined) patch.verified = input.verified;
	patch.updatedAt = new Date();

	const [updated] = await db
		.update(students)
		.set(patch)
		.where(eq(students.id, id))
		.returning();
	return updated;
}

async function deleteStudent(id: string) {
	await getStudentOrThrow(id);
	const [deleted] = await db.delete(students).where(eq(students.id, id)).returning();
	return deleted;
}

async function getNewAccessToken(refreshToken: string) {
	let decoded: { id: string; email: string };
	try {
		decoded = verifyUserRefreshToken(refreshToken);
	} catch {
		throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid refresh token");
	}

	const [studentRecord] = await db
		.select()
		.from(students)
		.where(eq(students.id, decoded.id))
		.limit(1);

	if (!studentRecord || studentRecord.refreshToken !== refreshToken) {
		throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid or expired refresh token");
	}

	const tokenPair = generateUserTokenPair({
		id: studentRecord.id,
		email: studentRecord.email,
		role: "student",
	});

	// Update refresh token in database
	await db
		.update(students)
		.set({ refreshToken: tokenPair.refreshToken, updatedAt: new Date() })
		.where(eq(students.id, studentRecord.id));

	return tokenPair;
}

export const studentsService = {
	createStudent,
	loginStudent,
	getStudents,
	getStudentById,
	updateStudent,
	deleteStudent,
	getNewAccessToken,
	// Aliases (backward compatible)
	create: createStudent,
	login: loginStudent,
	list: getStudents,
	getById: getStudentById,
	update: updateStudent,
	remove: deleteStudent,
	refreshAccessToken: getNewAccessToken,
};
