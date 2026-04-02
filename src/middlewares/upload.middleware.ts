import multer from "multer";
import multerConfig from "../config/multer.config";
import type { NextFunction, Request, Response } from "express";

const studentUpload = multerConfig("student", 10 * 1024 * 1024);
const teacherUpload = multerConfig("teacher", 10 * 1024 * 1024);

// reusable error handler wrapper
const handleUpload = (middleware: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        middleware(req, res, (err: any) => {
            if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).json({
                        success: false,
                        message: "File too large (max 10MB)",
                    });
                }

                return res.status(400).json({
                    success: false,
                    message: err.message,
                });
            } else if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Internal server error during file upload",
                });
            }
            next();
        });
    };
};

export const uploadSingle = (
    fieldName: string,
    folderName = "media",
    fileSize = 10 * 1024 * 1024
) => {
    const upload = multerConfig(folderName, fileSize);
    const uploadSingleMiddleware = upload.single(fieldName);
    return handleUpload(uploadSingleMiddleware);
};

export const uploadStudentPhoto = handleUpload(studentUpload.single("photo"));
export const uploadTeacherPhoto = handleUpload(teacherUpload.single("photo"));
