import { z } from "zod";

export const dayOfWeekSchema = z.enum([
	"MONDAY",
	"TUESDAY",
	"WEDNESDAY",
	"THURSDAY",
	"FRIDAY",
	"SATURDAY",
]);

export const createTimetableSlotSchema = z.object({
	sectionId: z.string().uuid(),
	dayOfWeek: dayOfWeekSchema,
	startTime: z.string().min(1),
	endTime: z.string().min(1),
	subjectId: z.string().uuid(),
	teacherId: z.string().uuid(),
	roomId: z.string().uuid().optional(),
});
export type createTimetableSlotSchemaType = z.infer<typeof createTimetableSlotSchema>;

export const updateTimetableSlotSchema = z
	.object({
		sectionId: z.string().uuid().optional(),
		dayOfWeek: dayOfWeekSchema.optional(),
		startTime: z.string().min(1).optional(),
		endTime: z.string().min(1).optional(),
		subjectId: z.string().uuid().optional(),
		teacherId: z.string().uuid().optional(),
		roomId: z.string().uuid().optional(),
	})
	.refine((obj) => Object.keys(obj).length > 0, {
		message: "At least one field is required",
	});
export type updateTimetableSlotSchemaType = z.infer<typeof updateTimetableSlotSchema>;

export const listTimetableSlotsQuerySchema = z
	.object({
		sectionId: z.string().uuid().optional(),
		dayOfWeek: dayOfWeekSchema.optional(),
		subjectId: z.string().uuid().optional(),
		teacherId: z.string().uuid().optional(),
		roomId: z.string().uuid().optional(),
		page: z.coerce.number().int().positive().optional(),
		limit: z.coerce.number().int().positive().optional(),
		order: z.enum(["asc", "desc"]).optional(),
	})
	.passthrough();
export type listTimetableSlotsQuerySchemaType = z.infer<typeof listTimetableSlotsQuerySchema>;
