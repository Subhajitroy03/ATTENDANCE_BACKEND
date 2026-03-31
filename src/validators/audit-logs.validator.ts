import { z } from "zod";

export const createAuditLogSchema = z.object({
	actorId: z.string().uuid(),
	action: z.string().min(1),
	entity: z.string().min(1),
	entityId: z.string().uuid(),
});
export type createAuditLogSchemaType = z.infer<typeof createAuditLogSchema>;

export const updateAuditLogSchema = z
	.object({
		actorId: z.string().uuid().optional(),
		action: z.string().min(1).optional(),
		entity: z.string().min(1).optional(),
		entityId: z.string().uuid().optional(),
	})
	.refine((obj) => Object.keys(obj).length > 0, {
		message: "At least one field is required",
	});
export type updateAuditLogSchemaType = z.infer<typeof updateAuditLogSchema>;

export const listAuditLogsQuerySchema = z
	.object({
		q: z.string().optional(),
		actorId: z.string().uuid().optional(),
		entity: z.string().optional(),
		entityId: z.string().uuid().optional(),
		page: z.coerce.number().int().positive().optional(),
		limit: z.coerce.number().int().positive().optional(),
		order: z.enum(["asc", "desc"]).optional(),
	})
	.passthrough();
export type listAuditLogsQuerySchemaType = z.infer<typeof listAuditLogsQuerySchema>;
