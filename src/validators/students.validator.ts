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
	sectionId: z.string().uuid({ message: "Invalid sectionId" }),
	photo: z.string().url().optional(),
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
		sectionId: z.string().uuid().optional(),
		photo: z.string().url().optional(),
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
		sectionId: z.string().uuid().optional(),
		status: studentStatusSchema.optional(),
		verified: z.coerce.boolean().optional(),
		page: z.coerce.number().int().positive().optional(),
		limit: z.coerce.number().int().positive().optional(),
		order: z.enum(["asc", "desc"]).optional(),
	})
	.passthrough();
export type listStudentsQuerySchemaType = z.infer<typeof listStudentsQuerySchema>;

export const loginStudentSchema = z.object({
	studentId: z.string().min(1, { message: "studentId is required" }),
	email: z
		.string()
		.email({ message: "Invalid email" })
		.refine((v) => isAotEduEmail(v), { message: "Email must end with @aot.edu.in" }),
});
export type loginStudentSchemaType = z.infer<typeof loginStudentSchema>;

export const refreshTokenSchema = z.object({
	refreshToken: z.string().min(1, { message: "refreshToken is required" }),
});
export type refreshTokenSchemaType = z.infer<typeof refreshTokenSchema>;
