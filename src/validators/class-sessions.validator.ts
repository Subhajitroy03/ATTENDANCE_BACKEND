import { z } from "zod";

export const classStatusSchema = z.enum(["SCHEDULED", "STARTED", "COMPLETED", "CANCELLED"]);

export const createClassSessionSchema = z.object({
	timetableSlotId: z.string().uuid(),
	date: z.string().min(1),
	status: classStatusSchema.optional(),
	teacherConfirmed: z.boolean().optional(),
	startTime: z.string().min(1).optional(),
	endTime: z.string().min(1).optional(),
});
export type createClassSessionSchemaType = z.infer<typeof createClassSessionSchema>;

export const updateClassSessionSchema = z
	.object({
		status: classStatusSchema.optional(),
		teacherConfirmed: z.boolean().optional(),
		startTime: z.string().min(1).optional(),
		endTime: z.string().min(1).optional(),
	})
	.refine((obj) => Object.keys(obj).length > 0, { message: "At least one field is required" });
export type updateClassSessionSchemaType = z.infer<typeof updateClassSessionSchema>;

export const listClassSessionsQuerySchema = z
	.object({
		timetableSlotId: z.string().uuid().optional(),
		status: classStatusSchema.optional(),
		teacherConfirmed: z.coerce.boolean().optional(),
		date: z.string().optional(),
		page: z.coerce.number().int().positive().optional(),
		limit: z.coerce.number().int().positive().optional(),
		order: z.enum(["asc", "desc"]).optional(),
	})
	.passthrough();
export type listClassSessionsQuerySchemaType = z.infer<typeof listClassSessionsQuerySchema>;
