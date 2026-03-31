import { z } from "zod";

export const createSubjectTeacherSchema = z.object({
	subjectId: z.string().uuid(),
	teacherId: z.string().uuid(),	isActive: z.boolean().optional(),
});
export type createSubjectTeacherSchemaType = z.infer<typeof createSubjectTeacherSchema>;

export const updateSubjectTeacherSchema = z
	.object({
		isActive: z.boolean().optional(),
	})
	.refine((obj) => Object.keys(obj).length > 0, { message: "At least one field is required" });
export type updateSubjectTeacherSchemaType = z.infer<typeof updateSubjectTeacherSchema>;

export const listSubjectTeachersQuerySchema = z
	.object({
		subjectId: z.string().uuid().optional(),
		teacherId: z.string().uuid().optional(),
		isActive: z.coerce.boolean().optional(),
		page: z.coerce.number().int().positive().optional(),
		limit: z.coerce.number().int().positive().optional(),
		order: z.enum(["asc", "desc"]).optional(),
	})
	.passthrough();
export type listSubjectTeachersQuerySchemaType = z.infer<typeof listSubjectTeachersQuerySchema>;
