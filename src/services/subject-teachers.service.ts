import { StatusCodes } from "http-status-codes";
import { asc, desc, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { departments, subjectTeachers, subjects, teachers } from "../db/schema.js";
import { ApiError } from "../utils/ApiError.js";
import {
	buildWhere,
	parseBoolean,
	parsePagination,
	parseString,
	type PaginationInput,
} from "../utils/listQuery.js";

export interface CreateSubjectTeacherInput {
	subjectId: string;
	teacherId: string;
	isActive?: boolean;
}

export interface UpdateSubjectTeacherInput {
	isActive?: boolean;
}

export interface ListSubjectTeachersQuery extends PaginationInput {
	subjectId?: unknown;
	teacherId?: unknown;
	isActive?: unknown;
}

const mappingSelect = {
	id: subjectTeachers.id,
	subjectId: subjectTeachers.subjectId,
	teacherId: subjectTeachers.teacherId,
	isActive: subjectTeachers.isActive,
	assignedAt: subjectTeachers.assignedAt,
};

const subjectSelect = {
	id: subjects.id,
	subjectCode: subjects.subjectCode,
	subjectName: subjects.subjectName,
	departmentId: subjects.departmentId,
	semester: subjects.semester,
	credits: subjects.credits,
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

const departmentSelect = {
	id: departments.id,
	name: departments.name,
	code: departments.code,
	createdAt: departments.createdAt,
};

async function getMappingOrThrow(id: string) {
	const rows = await db
		.select({
			mapping: mappingSelect,
			subject: subjectSelect,
			subjectDepartment: departmentSelect,
			teacher: teacherSelect,
		})
		.from(subjectTeachers)
		.innerJoin(subjects, eq(subjectTeachers.subjectId, subjects.id))
		.innerJoin(teachers, eq(subjectTeachers.teacherId, teachers.id))
		.innerJoin(departments, eq(subjects.departmentId, departments.id))
		.where(eq(subjectTeachers.id, id))
		.limit(1);
	if (!rows.length) throw new ApiError(StatusCodes.NOT_FOUND, "Subject-teacher mapping not found");
	const row = rows[0];
	return {
		...row.mapping,
		subject: {
			...row.subject,
			department: row.subjectDepartment,
		},
		teacher: row.teacher,
	};
}

async function createSubjectTeacher(input: CreateSubjectTeacherInput) {
	const [created] = await db.insert(subjectTeachers).values(input as any).returning();
	return created;
}

async function getSubjectTeachers(query: ListSubjectTeachersQuery) {
	const { limit, offset, order } = parsePagination(query);
	const subjectId = parseString(query.subjectId);
	const teacherId = parseString(query.teacherId);
	const isActive = parseBoolean(query.isActive);

	const where = buildWhere(
		subjectId ? eq(subjectTeachers.subjectId, subjectId) : undefined,
		teacherId ? eq(subjectTeachers.teacherId, teacherId) : undefined,
		isActive === undefined ? undefined : eq(subjectTeachers.isActive, isActive)
	);

	return await db
		.select({
			mapping: mappingSelect,
			subject: subjectSelect,
			subjectDepartment: {
				id: departments.id,
				name: departments.name,
				code: departments.code,
				createdAt: departments.createdAt,
			},
			teacher: teacherSelect,
		})
		.from(subjectTeachers)
		.innerJoin(subjects, eq(subjectTeachers.subjectId, subjects.id))
		.innerJoin(teachers, eq(subjectTeachers.teacherId, teachers.id))
		.innerJoin(departments, eq(subjects.departmentId, departments.id))
		.where(where)
		.orderBy(order === "asc" ? asc(subjectTeachers.assignedAt) : desc(subjectTeachers.assignedAt))
		.limit(limit)
		.offset(offset)
		.then((rows) =>
			rows.map((row) => ({
				...row.mapping,
				subject: {
					...row.subject,
					department: row.subjectDepartment,
				},
				teacher: row.teacher,
			}))
		);
}

async function getSubjectTeacherById(id: string) {
	return await getMappingOrThrow(id);
}

async function updateSubjectTeacher(id: string, input: UpdateSubjectTeacherInput) {
	await getMappingOrThrow(id);
	const [updated] = await db
		.update(subjectTeachers)
		.set(input)
		.where(eq(subjectTeachers.id, id))
		.returning();
	return updated;
}

async function deleteSubjectTeacher(id: string) {
	await getMappingOrThrow(id);
	const [deleted] = await db.delete(subjectTeachers).where(eq(subjectTeachers.id, id)).returning();
	return deleted;
}

export const subjectTeachersService = {
	createSubjectTeacher,
	getSubjectTeachers,
	getSubjectTeacherById,
	updateSubjectTeacher,
	deleteSubjectTeacher,
	// Aliases (backward compatible)
	create: createSubjectTeacher,
	list: getSubjectTeachers,
	getById: getSubjectTeacherById,
	update: updateSubjectTeacher,
	remove: deleteSubjectTeacher,
};
