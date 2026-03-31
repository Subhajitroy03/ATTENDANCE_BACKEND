import { z } from "zod";

export const attendanceStatusSchema = z.enum(["PRESENT", "ABSENT", "LATE"]);

export const createAttendanceSchema = z.object({
	classSessionId: z.string().uuid(),
	studentId: z.string().uuid(),
	status: attendanceStatusSchema,
	markedBy: z.string().min(1),
});
export type createAttendanceSchemaType = z.infer<typeof createAttendanceSchema>;

export const updateAttendanceSchema = z
	.object({
		status: attendanceStatusSchema.optional(),
		markedBy: z.string().min(1).optional(),
	})
	.refine((obj) => Object.keys(obj).length > 0, {
		message: "At least one field is required",
	});
export type updateAttendanceSchemaType = z.infer<typeof updateAttendanceSchema>;

export const listAttendanceQuerySchema = z
	.object({
		classSessionId: z.string().uuid().optional(),
		studentId: z.string().uuid().optional(),
		status: attendanceStatusSchema.optional(),
		markedBy: z.string().optional(),
		page: z.coerce.number().int().positive().optional(),
		limit: z.coerce.number().int().positive().optional(),
		order: z.enum(["asc", "desc"]).optional(),
	})
	.passthrough();
export type listAttendanceQuerySchemaType = z.infer<typeof listAttendanceQuerySchema>;
