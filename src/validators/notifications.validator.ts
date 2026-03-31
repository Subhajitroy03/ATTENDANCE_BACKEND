import { z } from "zod";

export const createNotificationSchema = z.object({
	userId: z.string().uuid(),
	type: z.string().min(1),
	message: z.string().min(1),
	read: z.boolean().optional(),
});
export type createNotificationSchemaType = z.infer<typeof createNotificationSchema>;

export const updateNotificationSchema = z
	.object({
		type: z.string().min(1).optional(),
		message: z.string().min(1).optional(),
		read: z.boolean().optional(),
	})
	.refine((obj) => Object.keys(obj).length > 0, {
		message: "At least one field is required",
	});
export type updateNotificationSchemaType = z.infer<typeof updateNotificationSchema>;

export const listNotificationsQuerySchema = z
	.object({
		q: z.string().optional(),
		userId: z.string().uuid().optional(),
		type: z.string().optional(),
		read: z.coerce.boolean().optional(),
		page: z.coerce.number().int().positive().optional(),
		limit: z.coerce.number().int().positive().optional(),
		order: z.enum(["asc", "desc"]).optional(),
	})
	.passthrough();
export type listNotificationsQuerySchemaType = z.infer<typeof listNotificationsQuerySchema>;
