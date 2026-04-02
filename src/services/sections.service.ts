import { StatusCodes } from "http-status-codes";
import { asc, desc, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { departments, sections, teachers } from "../db/schema.js";
import { ApiError } from "../utils/ApiError.js";
import {
	buildSearch,
	buildWhere,
	parseNumber,
	parsePagination,
	parseString,
	type PaginationInput,
} from "../utils/listQuery.js";

export interface CreateSectionInput {
	departmentId: string;
	semester: number;
	section: number;
	classTeacherId?: string | null;
	name: string;
	capacity?: number;
}

export interface UpdateSectionInput {
	departmentId?: string;
	semester?: number;
	section?: number;
	classTeacherId?: string | null;
	name?: string;
	capacity?: number;
}

export interface ListSectionsQuery extends PaginationInput {
	q?: unknown;
	departmentId?: unknown;
	semester?: unknown;
	section?: unknown;
}

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

const classTeacherSelect = {
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

async function getSectionOrThrow(id: string) {
	const rows = await db
		.select({
			section: sectionSelect,
			department: departmentSelect,
			classTeacher: classTeacherSelect,
		})
		.from(sections)
		.innerJoin(departments, eq(sections.departmentId, departments.id))
		.leftJoin(teachers, eq(sections.classTeacherId, teachers.id))
		.where(eq(sections.id, id))
		.limit(1);
	if (!rows.length) throw new ApiError(StatusCodes.NOT_FOUND, "Section not found");
	const row = rows[0];
	return {
		...row.section,
		department: row.department,
		classTeacher: row.classTeacher,
	};
}

async function createSection(input: CreateSectionInput) {
	const [created] = await db.insert(sections).values(input).returning();
	return created;
}

async function getSections(query: ListSectionsQuery) {
	const { limit, offset, order } = parsePagination(query);
	const departmentId = parseString(query.departmentId);
	const semester = parseNumber(query.semester);
	const section = parseNumber(query.section);
	const where = buildWhere(
		buildSearch(query.q, sections.name),
		departmentId ? eq(sections.departmentId, departmentId) : undefined,
		semester === undefined ? undefined : eq(sections.semester, semester),
		section === undefined ? undefined : eq(sections.section, section)
	);

	return await db
		.select({
			section: sectionSelect,
			department: departmentSelect,
			classTeacher: classTeacherSelect,
		})
		.from(sections)
		.innerJoin(departments, eq(sections.departmentId, departments.id))
		.leftJoin(teachers, eq(sections.classTeacherId, teachers.id))
		.where(where)
		.orderBy(order === "asc" ? asc(sections.createdAt) : desc(sections.createdAt))
		.limit(limit)
		.offset(offset)
		.then((rows) =>
			rows.map((row) => ({
				...row.section,
				department: row.department,
				classTeacher: row.classTeacher,
			}))
		);
}

async function getSectionById(id: string) {
	return await getSectionOrThrow(id);
}

async function updateSection(id: string, input: UpdateSectionInput) {
	await getSectionOrThrow(id);
	const [updated] = await db.update(sections).set(input).where(eq(sections.id, id)).returning();
	return updated;
}

async function deleteSection(id: string) {
	await getSectionOrThrow(id);
	const [deleted] = await db.delete(sections).where(eq(sections.id, id)).returning();
	return deleted;
}

export const sectionsService = {
	createSection,
	getSections,
	getSectionById,
	updateSection,
	deleteSection,
	// Aliases (backward compatible)
	create: createSection,
	list: getSections,
	getById: getSectionById,
	update: updateSection,
	remove: deleteSection,
};
