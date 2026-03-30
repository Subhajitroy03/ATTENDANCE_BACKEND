import multer from "multer";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import { logger } from "./logger";

const BASE_UPLOAD_DIR =
    process.env.UPLOAD_DIR ||
    (process.env.NODE_ENV === "production"
        ? path.join(os.tmpdir(), "uploads")
        : path.join(process.cwd(), "src", "uploads"));

const multerConfig = (
    folderName = "",
    fileSize = 10 * 1024 * 1024
) => {

    const safeFolder = folderName.trim().replace(/^\/+|\/+$/g, "");
    const uploadPath = path.join(BASE_UPLOAD_DIR, safeFolder);

    try {
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
            logger.info(`Created upload folder: ${uploadPath}`);
        }
    } catch (err) {
        logger.error("Error creating upload folder:", err);
        throw err;
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            const uniqueName =
                `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
            cb(null, uniqueName);
        }
    });

    return multer({
        storage,
        limits: {
            fileSize,
            fieldNameSize: 100,
            fieldSize: 10 * 1024 * 1024
        },
        fileFilter: (req, file, cb) => {
            const allowedTypes = [
                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/webp",
            ];
            const allowedExts = [
                ".jpg",
                ".jpeg",
                ".png",
                ".webp",
            ];

            const extname = allowedExts.includes(
                path.extname(file.originalname.toLowerCase())
            );
            const mimetype = allowedTypes.includes(file.mimetype);
            if (mimetype && extname) {
                logger.info(`File accepted: ${file.originalname}`);
                cb(null, true);
            } else {
                logger.warn(`File rejected: ${file.originalname}`);
                cb(new Error("Only JPG, JPEG, PNG, WEBP allowed"));
            }
        }
    });
};

export default multerConfig;