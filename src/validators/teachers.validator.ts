import { z } from "zod";
import { isAotEduEmail } from "../utils/email.js";

export const teacherStatusSchema = z.enum([
	"ACTIVE",
	"INACTIVE",
	"SUSPENDED",
	"GRADUATED",
]);

export const createTeacherSchema = z.object({
	employeeId: z.string().min(1, { message: "employeeId is required" }),
	name: z.string().min(1, { message: "name is required" }),
	email: z
		.string()
		.email({ message: "Invalid email" })
		.refine((v) => isAotEduEmail(v), { message: "Email must end with @aot.edu.in" }),
	abbreviation: z.string().min(1).max(10).optional(),
	phone: z.string().min(5).max(20).optional(),
	departmentId: z.string().uuid({ message: "Invalid departmentId" }),
	password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});
export type createTeacherSchemaType = z.infer<typeof createTeacherSchema>;

export const updateTeacherSchema = z
	.object({
		employeeId: z.string().min(1).optional(),
		name: z.string().min(1).optional(),
		email: z
			.string()
			.email({ message: "Invalid email" })
			.refine((v) => isAotEduEmail(v), { message: "Email must end with @aot.edu.in" })
			.optional(),
		abbreviation: z.string().min(1).max(10).optional(),
		phone: z.string().min(5).max(20).optional(),
		departmentId: z.string().uuid().optional(),
		password: z.string().min(8).optional(),
		status: teacherStatusSchema.optional(),
		verified: z.boolean().optional(),
	})
	.refine((obj) => Object.keys(obj).length > 0, {
		message: "At least one field is required",
	});
export type updateTeacherSchemaType = z.infer<typeof updateTeacherSchema>;

export const listTeachersQuerySchema = z
	.object({
		q: z.string().optional(),
		departmentId: z.string().uuid().optional(),
		status: teacherStatusSchema.optional(),
		verified: z.coerce.boolean().optional(),
		page: z.coerce.number().int().positive().optional(),
		limit: z.coerce.number().int().positive().optional(),
		order: z.enum(["asc", "desc"]).optional(),
	})
	.passthrough();
export type listTeachersQuerySchemaType = z.infer<typeof listTeachersQuerySchema>;

export const loginTeacherSchema = z.object({
	email: z
		.string()
		.email({ message: "Invalid email" })
		.refine((v) => isAotEduEmail(v), { message: "Email must end with @aot.edu.in" }),
	password: z.string().min(1, { message: "password is required" }),
});
export type loginTeacherSchemaType = z.infer<typeof loginTeacherSchema>;
