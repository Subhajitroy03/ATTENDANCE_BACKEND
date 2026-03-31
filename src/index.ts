import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import type { CorsOptions } from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import v1Router from "./routes/v1";
import { errorHandler } from "./middlewares/globalerrorHandler";
import { logger } from "./config/logger";
dotenv.config();
const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 5000;
const nodeEnv = process.env.NODE_ENV ?? "development";
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(express.json());
app.use(cookieParser());

let corsOptions: CorsOptions;

if (!frontendUrl) {
    if (nodeEnv === "production") {
        logger.error("FRONTEND_URL is not configured");
        throw new Error("FRONTEND_URL is not configured");
    }

    logger.warn("FRONTEND_URL is not configured; allowing all origins in non-production");
    corsOptions = {
        origin: true,
        credentials: true,
    };
} else {
    const allowedOrigins = frontendUrl
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);

    if (allowedOrigins.length === 0) {
        logger.error("FRONTEND_URL must contain at least one valid origin");
        throw new Error("FRONTEND_URL must contain at least one valid origin");
    }

    corsOptions = {
        origin: (origin, callback) => {
            // Allow non-browser clients like Postman (no Origin header)
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }

            callback(new Error("CORS policy violation: origin not allowed"));
        },
        credentials: true,
    };
}

app.use(cors(corsOptions));

app.use("/api/v1", v1Router);

app.get("/", (req: Request, res: Response) => {
    res.json({
		success: true,
		message: "Attendance Backend is healthy",
		timestamp: new Date().toISOString(),
	});
});

app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`Server is running on port http://localhost:${PORT}`);
});