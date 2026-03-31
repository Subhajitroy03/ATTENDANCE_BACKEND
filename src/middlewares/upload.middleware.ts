import multer from "multer";
import multerConfig from "../config/multer.config";
import type { NextFunction, Request, Response } from "express";

// create multer instance (NOT single/array here)
const upload = multerConfig(
    "media/",
    1024 * 1024 * 1024
);

// reusable error handler wrapper
const handleUpload = (middleware: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        middleware(req, res, (err: any) => {
            if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).json({
                        success: false,
                        message: "File too large (max 1GB)",
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

export const uploadSingle = (fieldName: string) => {
    const uploadSingleMiddleware = upload.single(fieldName);
    return handleUpload(uploadSingleMiddleware);
};
