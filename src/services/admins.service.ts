import { StatusCodes } from "http-status-codes";
import { asc, desc, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { admins, students, teachers } from "../db/schema.js";
import { ApiError } from "../utils/ApiError.js";
import { assertAotEduEmail, normalizeEmail } from "../utils/email.js";
import { comparePassword, hashPassword } from "../utils/hashPass.js";
import { generateTokenPair, verifyRefreshToken } from "../utils/jwt.js";
import {
	buildSearch,
	buildWhere,
	parsePagination,
	parseString,
	type PaginationInput,
} from "../utils/listQuery.js";

export interface CreateAdminInput {
	email: string;
	password: string;
}

export interface LoginAdminInput {
	email: string;
	password: string;
}

export interface UpdateAdminInput {
	email?: string;
	password?: string;
	status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "GRADUATED";
}

export interface ListAdminsQuery extends PaginationInput {
	q?: unknown;
	status?: unknown;
}

export interface VerifyTeacherInput {
	teacherId: string;
	verified?: boolean;
}

export interface VerifyStudentInput {
	studentId: string;
	verified?: boolean;
}

const adminPublicSelect = {
	id: admins.id,
	email: admins.email,
	role: admins.role,
	status: admins.status,
	createdAt: admins.createdAt,
	updatedAt: admins.updatedAt,
};

const adminAuthSelect = {
	...adminPublicSelect,
	password: admins.password,
};

const teacherVerifySelect = {
	id: teachers.id,
	employeeId: teachers.employeeId,
	name: teachers.name,
	email: teachers.email,
	abbreviation: teachers.abbreviation,
	phone: teachers.phone,
	departmentId: teachers.departmentId,
	status: teachers.status,
	role: teachers.role,
	verified: teachers.verified,
	createdAt: teachers.createdAt,
	updatedAt: teachers.updatedAt,
};

const studentVerifySelect = {
	id: students.id,
	studentId: students.studentId,
	name: students.name,
	email: students.email,
	sectionId: students.sectionId,
	status: students.status,
	role: students.role,
	verified: students.verified,
	createdAt: students.createdAt,
	updatedAt: students.updatedAt,
};

async function getAdminOrThrow(id: string) {
	const rows = await db
		.select(adminPublicSelect)
		.from(admins)
		.where(eq(admins.id, id))
		.limit(1);
	if (!rows.length) throw new ApiError(StatusCodes.NOT_FOUND, "Admin not found");
	return rows[0];
}

async function getTeacherOrThrow(id: string) {
	const rows = await db
		.select(teacherVerifySelect)
		.from(teachers)
		.where(eq(teachers.id, id))
		.limit(1);
	if (!rows.length) throw new ApiError(StatusCodes.NOT_FOUND, "Teacher not found");
	return rows[0];
}

async function getStudentOrThrow(id: string) {
	const rows = await db
		.select(studentVerifySelect)
		.from(students)
		.where(eq(students.id, id))
		.limit(1);
	if (!rows.length) throw new ApiError(StatusCodes.NOT_FOUND, "Student not found");
	return rows[0];
}

async function createAdmin(input: CreateAdminInput) {
	assertAotEduEmail(input.email);
	const email = normalizeEmail(input.email);
	const password = await hashPassword(input.password);

	const [created] = await db
		.insert(admins)
		.values({ email, password })
		.returning(adminPublicSelect);

	return created;
}

async function getAdmins(query: ListAdminsQuery) {
	const { limit, offset, order } = parsePagination(query);
	const status = parseString(query.status);
	const where = buildWhere(
		buildSearch(query.q, admins.email),
		status ? eq(admins.status, status as any) : undefined
	);

	return await db
		.select(adminPublicSelect)
		.from(admins)
		.where(where)
		.orderBy(order === "asc" ? asc(admins.createdAt) : desc(admins.createdAt))
		.limit(limit)
		.offset(offset);
}

async function getAdminById(id: string) {
	return await getAdminOrThrow(id);
}

async function updateAdmin(id: string, input: UpdateAdminInput) {
	await getAdminOrThrow(id);
	const patch: Partial<typeof admins.$inferInsert> = {};

	if (input.email !== undefined) {
		assertAotEduEmail(input.email);
		patch.email = normalizeEmail(input.email);
	}
	if (input.password !== undefined) {
		patch.password = await hashPassword(input.password);
	}
	if (input.status !== undefined) {
		patch.status = input.status as any;
	}
	patch.updatedAt = new Date();

	const [updated] = await db
		.update(admins)
		.set(patch)
		.where(eq(admins.id, id))
		.returning(adminPublicSelect);
	return updated;
}

async function deleteAdmin(id: string) {
	await getAdminOrThrow(id);
	const [deleted] = await db
		.delete(admins)
		.where(eq(admins.id, id))
		.returning(adminPublicSelect);
	return deleted;
}

async function loginAdmin(input: LoginAdminInput) {
	assertAotEduEmail(input.email);
	const email = normalizeEmail(input.email);

	const rows = await db
		.select(adminAuthSelect)
		.from(admins)
		.where(eq(admins.email, email))
		.limit(1);

	if (!rows.length) {
		throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
	}

	const admin = rows[0];
	const ok = await comparePassword(input.password, admin.password);
	if (!ok) {
		throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
	}
	if (admin.status !== "ACTIVE") {
		throw new ApiError(StatusCodes.FORBIDDEN, "Admin account is not active");
	}

	const tokens = generateTokenPair({
		id: admin.id,
		email: admin.email,
		role: "admin",
	});

	// Save refresh token to database
	await db
		.update(admins)
		.set({ refreshToken: tokens.refreshToken, updatedAt: new Date() })
		.where(eq(admins.id, admin.id));

	// Exclude password from response
	const { password, ...safeAdmin } = admin;
	return {
		admin: safeAdmin,
		...tokens,
	};
}

async function getNewAccessToken(refreshToken: string) {
	let decoded: { id: string; email: string };
	try {
		decoded = verifyRefreshToken(refreshToken);
	} catch {
		throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid refresh token");
	}

	const [adminRecord] = await db
		.select()
		.from(admins)
		.where(eq(admins.id, decoded.id))
		.limit(1);

	if (!adminRecord || adminRecord.refreshToken !== refreshToken) {
		throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid or expired refresh token");
	}

	const tokenPair = generateTokenPair({
		id: adminRecord.id,
		email: adminRecord.email,
		role: "admin",
	});

	// Update refresh token in database
	await db
		.update(admins)
		.set({ refreshToken: tokenPair.refreshToken, updatedAt: new Date() })
		.where(eq(admins.id, adminRecord.id));

	return tokenPair;
}

async function verifyTeacher(input: VerifyTeacherInput) {
	await getTeacherOrThrow(input.teacherId);
	const verified = input.verified ?? true;

	const [updated] = await db
		.update(teachers)
		.set({ verified, updatedAt: new Date() })
		.where(eq(teachers.id, input.teacherId))
		.returning(teacherVerifySelect);

	return updated;
}

async function verifyStudent(input: VerifyStudentInput) {
	await getStudentOrThrow(input.studentId);
	const verified = input.verified ?? true;

	const [updated] = await db
		.update(students)
		.set({ verified, updatedAt: new Date() })
		.where(eq(students.id, input.studentId))
		.returning(studentVerifySelect);

	return updated;
}

export const adminsService = {
	createAdmin,
	getAdmins,
	getAdminById,
	updateAdmin,
	deleteAdmin,
	loginAdmin,
	getNewAccessToken,
	verifyTeacher,
	verifyStudent,
	// Aliases (backward compatible)
	create: createAdmin,
	list: getAdmins,
	getById: getAdminById,
	update: updateAdmin,
	remove: deleteAdmin,
	login: loginAdmin,
	refreshAccessToken: getNewAccessToken,
};

