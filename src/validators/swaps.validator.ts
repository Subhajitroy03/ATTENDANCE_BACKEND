import { z } from "zod";

export const swapStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"]);

export const createSwapSchema = z.object({
	fromTeacherId: z.string().uuid(),
	toTeacherId: z.string().uuid(),
	classSessionId: z.string().uuid(),
	status: swapStatusSchema.optional(),
});
export type createSwapSchemaType = z.infer<typeof createSwapSchema>;

export const updateSwapSchema = z
	.object({
		fromTeacherId: z.string().uuid().optional(),
		toTeacherId: z.string().uuid().optional(),
		classSessionId: z.string().uuid().optional(),
		status: swapStatusSchema.optional(),
	})
	.refine((obj) => Object.keys(obj).length > 0, {
		message: "At least one field is required",
	});
export type updateSwapSchemaType = z.infer<typeof updateSwapSchema>;

export const listSwapsQuerySchema = z
	.object({
		fromTeacherId: z.string().uuid().optional(),
		toTeacherId: z.string().uuid().optional(),
		classSessionId: z.string().uuid().optional(),
		status: swapStatusSchema.optional(),
		page: z.coerce.number().int().positive().optional(),
		limit: z.coerce.number().int().positive().optional(),
		order: z.enum(["asc", "desc"]).optional(),
	})
	.passthrough();
export type listSwapsQuerySchemaType = z.infer<typeof listSwapsQuerySchema>;
