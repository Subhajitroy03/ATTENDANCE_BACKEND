import { z } from "zod";
import { isAotEduEmail } from "../utils/email.js";

export const studentStatusSchema = z.enum([
	"ACTIVE",
	"INACTIVE",
	"SUSPENDED",
	"GRADUATED",
]);

export const createStudentSchema = z.object({
	studentId: z.string().min(1, { message: "studentId is required" }),
	name: z.string().min(1, { message: "name is required" }),
	email: z
		.string()
		.email({ message: "Invalid email" })
		.refine((v) => isAotEduEmail(v), { message: "Email must end with @aot.edu.in" }),
	departmentId: z.string().uuid({ message: "Invalid departmentId" }),
	semester: z.number().int().min(1).max(10),
	section: z.string().min(1),
});
export type createStudentSchemaType = z.infer<typeof createStudentSchema>;

export const updateStudentSchema = z
	.object({
		studentId: z.string().min(1).optional(),
		name: z.string().min(1).optional(),
		email: z
			.string()
			.email({ message: "Invalid email" })
			.refine((v) => isAotEduEmail(v), { message: "Email must end with @aot.edu.in" })
			.optional(),
		departmentId: z.string().uuid().optional(),
		semester: z.number().int().min(1).max(10).optional(),
		section: z.string().min(1).optional(),
		status: studentStatusSchema.optional(),
		verified: z.boolean().optional(),
	})
	.refine((obj) => Object.keys(obj).length > 0, {
		message: "At least one field is required",
	});
export type updateStudentSchemaType = z.infer<typeof updateStudentSchema>;

export const listStudentsQuerySchema = z
	.object({
		q: z.string().optional(),
		departmentId: z.string().uuid().optional(),
		semester: z.coerce.number().int().min(1).max(10).optional(),
		section: z.string().optional(),
		status: studentStatusSchema.optional(),
		verified: z.coerce.boolean().optional(),
		page: z.coerce.number().int().positive().optional(),
		limit: z.coerce.number().int().positive().optional(),
		order: z.enum(["asc", "desc"]).optional(),
	})
	.passthrough();
export type listStudentsQuerySchemaType = z.infer<typeof listStudentsQuerySchema>;
