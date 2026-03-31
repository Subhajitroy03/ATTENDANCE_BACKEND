import { z } from "zod";

export const createRoomSchema = z.object({
	roomNumber: z.string().min(1),
	capacity: z.number().int().positive().optional(),
	block: z.string().min(1).optional(),
	floor: z.number().int().optional(),
});
export type createRoomSchemaType = z.infer<typeof createRoomSchema>;

export const updateRoomSchema = z
	.object({
		roomNumber: z.string().min(1).optional(),
		capacity: z.number().int().positive().optional(),
		block: z.string().min(1).optional(),
		floor: z.number().int().optional(),
	})
	.refine((obj) => Object.keys(obj).length > 0, {
		message: "At least one field is required",
	});
export type updateRoomSchemaType = z.infer<typeof updateRoomSchema>;

export const listRoomsQuerySchema = z
	.object({
		q: z.string().optional(),
		block: z.string().optional(),
		floor: z.coerce.number().int().optional(),
		page: z.coerce.number().int().positive().optional(),
		limit: z.coerce.number().int().positive().optional(),
		order: z.enum(["asc", "desc"]).optional(),
	})
	.passthrough();
export type listRoomsQuerySchemaType = z.infer<typeof listRoomsQuerySchema>;
