import type { ErrorRequestHandler } from "express";
import { ApiError } from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { logger } from "../config/logger.js";

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    const errorStack = err instanceof Error ? err.stack : undefined;
    const requestId = req.headers["x-request-id"] || req.headers["x-correlation-id"];
    const normalizedRequestId =
        typeof requestId === "string"
            ? requestId
            : Array.isArray(requestId)
                ? requestId[0]
                : undefined;

    logger.error(
        `[${req.method}] ${req.originalUrl} - ${errorMessage}${errorStack ? `\n${errorStack}` : ""}`
    );

    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
                details: err.details,
            },
            meta: {
                path: req.originalUrl,
                method: req.method,
                timestamp: new Date().toISOString(),
                requestId: normalizedRequestId,
            },
        });
    }

    else {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "An unexpected error occurred on the server.",
                details: [],
            },
            meta: {
                path: req.originalUrl,
                method: req.method,
                timestamp: new Date().toISOString(),
                requestId: normalizedRequestId,
            },
        });
    }
};