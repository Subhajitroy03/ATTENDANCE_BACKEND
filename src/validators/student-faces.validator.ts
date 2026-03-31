import { z } from "zod";

export const createStudentFaceSchema = z.object({
	studentId: z.string().uuid(),
	faceEmbedding: z.string().optional(),
	faceImageUrl: z.string().min(1),
	version: z.number().int().min(1),
	isActive: z.boolean().optional(),
});
export type createStudentFaceSchemaType = z.infer<typeof createStudentFaceSchema>;

export const updateStudentFaceSchema = z
	.object({
		faceEmbedding: z.string().optional(),
		faceImageUrl: z.string().min(1).optional(),
		version: z.number().int().min(1).optional(),
		isActive: z.boolean().optional(),
	})
	.refine((obj) => Object.keys(obj).length > 0, { message: "At least one field is required" });
export type updateStudentFaceSchemaType = z.infer<typeof updateStudentFaceSchema>;

export const listStudentFacesQuerySchema = z
	.object({
		studentId: z.string().uuid().optional(),
		version: z.coerce.number().int().min(1).optional(),
		isActive: z.coerce.boolean().optional(),
		page: z.coerce.number().int().positive().optional(),
		limit: z.coerce.number().int().positive().optional(),
		order: z.enum(["asc", "desc"]).optional(),
	})
	.passthrough();
export type listStudentFacesQuerySchemaType = z.infer<typeof listStudentFacesQuerySchema>;
