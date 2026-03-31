import { z } from "zod";

export const createSectionRoomSchema = z.object({
	sectionId: z.string().uuid(),
	roomId: z.string().uuid(),
});
export type createSectionRoomSchemaType = z.infer<typeof createSectionRoomSchema>;

export const updateSectionRoomSchema = z
	.object({
		sectionId: z.string().uuid().optional(),
		roomId: z.string().uuid().optional(),
	})
	.refine((obj) => Object.keys(obj).length > 0, { message: "At least one field is required" });
export type updateSectionRoomSchemaType = z.infer<typeof updateSectionRoomSchema>;

export const listSectionRoomsQuerySchema = z
	.object({
		sectionId: z.string().uuid().optional(),
		roomId: z.string().uuid().optional(),
		page: z.coerce.number().int().positive().optional(),
		limit: z.coerce.number().int().positive().optional(),
	})
	.passthrough();
export type listSectionRoomsQuerySchemaType = z.infer<typeof listSectionRoomsQuerySchema>;
