import { z } from "zod";

export const createDepartmentSchema = z.object({
	name: z.string().min(1, { message: "name is required" }),
	code: z.string().min(1, { message: "code is required" }),
});
export type createDepartmentSchemaType = z.infer<typeof createDepartmentSchema>;

export const updateDepartmentSchema = z
	.object({
		name: z.string().min(1).optional(),
		code: z.string().min(1).optional(),
	})
	.refine((obj) => Object.keys(obj).length > 0, {
		message: "At least one field is required",
	});
export type updateDepartmentSchemaType = z.infer<typeof updateDepartmentSchema>;

export const listDepartmentsQuerySchema = z
	.object({
		q: z.string().optional(),
		code: z.string().optional(),
		page: z.coerce.number().int().positive().optional(),
		limit: z.coerce.number().int().positive().optional(),
		order: z.enum(["asc", "desc"]).optional(),
	})
	.passthrough();
export type listDepartmentsQuerySchemaType = z.infer<typeof listDepartmentsQuerySchema>;
