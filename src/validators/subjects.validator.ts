import { z } from "zod";

export const createSubjectSchema = z.object({
	subjectCode: z.string().min(1),
	subjectName: z.string().min(1),
	departmentId: z.string().uuid(),
	semester: z.number().int().min(1).max(10),
	credits: z.number().int().positive().optional(),
});
export type createSubjectSchemaType = z.infer<typeof createSubjectSchema>;

export const updateSubjectSchema = z
	.object({
		subjectCode: z.string().min(1).optional(),
		subjectName: z.string().min(1).optional(),
		departmentId: z.string().uuid().optional(),
		semester: z.number().int().min(1).max(10).optional(),
		credits: z.number().int().positive().optional(),
	})
	.refine((obj) => Object.keys(obj).length > 0, {
		message: "At least one field is required",
	});
export type updateSubjectSchemaType = z.infer<typeof updateSubjectSchema>;

export const listSubjectsQuerySchema = z
	.object({
		q: z.string().optional(),
		departmentId: z.string().uuid().optional(),
		semester: z.coerce.number().int().min(1).max(10).optional(),
		page: z.coerce.number().int().positive().optional(),
		limit: z.coerce.number().int().positive().optional(),
		order: z.enum(["asc", "desc"]).optional(),
	})
	.passthrough();
export type listSubjectsQuerySchemaType = z.infer<typeof listSubjectsQuerySchema>;
