import { z } from "zod";

export const createTeacherConfirmationSchema = z.object({
	classSessionId: z.string().uuid(),
	teacherId: z.string().uuid(),
});
export type createTeacherConfirmationSchemaType = z.infer<typeof createTeacherConfirmationSchema>;

export const updateTeacherConfirmationSchema = z
	.object({
		classSessionId: z.string().uuid().optional(),
		teacherId: z.string().uuid().optional(),
		confirmedAt: z.coerce.date().optional(),
	})
	.refine((obj) => Object.keys(obj).length > 0, { message: "At least one field is required" });
export type updateTeacherConfirmationSchemaType = z.infer<typeof updateTeacherConfirmationSchema>;

export const listTeacherConfirmationsQuerySchema = z
	.object({
		classSessionId: z.string().uuid().optional(),
		teacherId: z.string().uuid().optional(),
		page: z.coerce.number().int().positive().optional(),
		limit: z.coerce.number().int().positive().optional(),
		order: z.enum(["asc", "desc"]).optional(),
	})
	.passthrough();
export type listTeacherConfirmationsQuerySchemaType = z.infer<typeof listTeacherConfirmationsQuerySchema>;
