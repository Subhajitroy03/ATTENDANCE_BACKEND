import { z } from "zod";
import { isAotEduEmail } from "../utils/email.js";

export const createAdminSchema = z.object({
    email: z
        .string()
        .email({ message: "Invalid email address" })
        .refine((v) => isAotEduEmail(v), { message: "Email must end with @aot.edu.in" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
});
export type createAdminSchemaType = z.infer<typeof createAdminSchema>;

export const loginAdminSchema = z.object({
    email: z
        .string()
        .email({ message: "Invalid email address" })
        .refine((v) => isAotEduEmail(v), { message: "Email must end with @aot.edu.in" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
});

export type loginAdminSchemaType = z.infer<typeof loginAdminSchema>;

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, { message: "refreshToken is required" }),
});

export type refreshTokenSchemaType = z.infer<typeof refreshTokenSchema>;

export const updateAdminSchema = z.object({
    email: z
        .string()
        .email({ message: "Invalid email address" })
        .refine((v) => isAotEduEmail(v), { message: "Email must end with @aot.edu.in" })
        .optional(),
    password: z.string().min(8, { message: "Password must be at least 8 characters long" }).optional(),
}).refine((value) => value.email || value.password, {
    message: "At least one field (email or password) is required",
});

export type updateAdminSchemaType = z.infer<typeof updateAdminSchema>;

export const verifyTeacherSchema = z.object({
    teacherId: z.string().min(1, { message: "teacherId is required" }),
    verified: z.boolean().optional(),
});

export type verifyTeacherSchemaType = z.infer<typeof verifyTeacherSchema>;

export const verifyStudentSchema = z.object({
    studentId: z.string().min(1, { message: "studentId is required" }),
    verified: z.boolean().optional(),
});

export type verifyStudentSchemaType = z.infer<typeof verifyStudentSchema>;