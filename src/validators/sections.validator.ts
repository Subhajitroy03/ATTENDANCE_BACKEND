import { z } from "zod";

export const createSectionSchema = z.object({
	departmentId: z.string().uuid(),
	semester: z.number().int().min(1).max(10),
	section: z.number().int().min(1),
	classTeacherId: z.string().uuid().nullable().optional(),
	name: z.string().min(1),
	capacity: z.number().int().positive().optional(),
});
export type createSectionSchemaType = z.infer<typeof createSectionSchema>;

export const updateSectionSchema = z
	.object({
		departmentId: z.string().uuid().optional(),
		semester: z.number().int().min(1).max(10).optional(),
		section: z.number().int().min(1).optional(),
		classTeacherId: z.string().uuid().nullable().optional(),
		name: z.string().min(1).optional(),
		capacity: z.number().int().positive().optional(),
	})
	.refine((obj) => Object.keys(obj).length > 0, {
		message: "At least one field is required",
	});
export type updateSectionSchemaType = z.infer<typeof updateSectionSchema>;

export const listSectionsQuerySchema = z
	.object({
		q: z.string().optional(),
		departmentId: z.string().uuid().optional(),
		semester: z.coerce.number().int().min(1).max(10).optional(),
		section: z.coerce.number().int().min(1).optional(),
		page: z.coerce.number().int().positive().optional(),
		limit: z.coerce.number().int().positive().optional(),
		order: z.enum(["asc", "desc"]).optional(),
	})
	.passthrough();
export type listSectionsQuerySchemaType = z.infer<typeof listSectionsQuerySchema>;
