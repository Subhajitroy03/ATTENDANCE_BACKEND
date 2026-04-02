import type { ErrorRequestHandler } from "express";
import { ApiError } from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { logger } from "../config/logger.js";

type PostgresLikeError = {
    code?: string;
    detail?: string;
    constraint?: string;
    table?: string;
    column?: string;
    message?: string;
    cause?: unknown;
};

function isPostgresLikeError(error: unknown): error is PostgresLikeError {
    if (!error || typeof error !== "object") return false;
    const maybe = error as { code?: unknown };
    return typeof maybe.code === "string";
}

function toTitleCase(input: string): string {
    return input
        .replace(/_/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/^\w/, (ch) => ch.toUpperCase());
}

function extractPgDetail(detail?: string): { field?: string; value?: string } {
    if (!detail) return {};

    const keyMatch = /Key \(([^)]+)\)=\(([^)]+)\)/i.exec(detail);
    if (!keyMatch) return {};

    return {
        field: keyMatch[1],
        value: keyMatch[2],
    };
}

function getErrorChain(error: unknown): unknown[] {
    const chain: unknown[] = [];
    const seen = new Set<unknown>();
    let current: unknown = error;

    while (current && typeof current === "object" && !seen.has(current)) {
        chain.push(current);
        seen.add(current);

        const maybeWithCause = current as { cause?: unknown };
        current = maybeWithCause.cause;
    }

    return chain;
}

function mapKnownError(err: unknown): ApiError | null {
    // Express JSON parser error for malformed payloads.
    if (err instanceof SyntaxError && "body" in err) {
        return new ApiError(StatusCodes.BAD_REQUEST, "Invalid JSON body", {
            code: "INVALID_JSON",
            details: [{ message: "Request body contains malformed JSON." }],
        });
    }

    if (!isPostgresLikeError(err)) return null;

    const fieldFromColumn = err.column;
    const { field: fieldFromDetail, value } = extractPgDetail(err.detail);
    const field = fieldFromColumn || fieldFromDetail;

    switch (err.code) {
        case "23505": {
            const message = field
                ? `${toTitleCase(field)} already exists`
                : "Duplicate value violates a unique constraint";

            return new ApiError(StatusCodes.CONFLICT, message, {
                code: "UNIQUE_CONSTRAINT_VIOLATION",
                details: [
                    {
                        field,
                        message: value ? `Value '${value}' already exists.` : "Duplicate value.",
                        code: err.constraint,
                    },
                ],
            });
        }

        case "23503": {
            return new ApiError(StatusCodes.BAD_REQUEST, "Referenced record does not exist", {
                code: "FOREIGN_KEY_VIOLATION",
                details: [
                    {
                        field,
                        message: err.detail || err.message || "Invalid reference value.",
                        code: err.constraint,
                    },
                ],
            });
        }

        case "23502": {
            return new ApiError(StatusCodes.BAD_REQUEST, "Required field is missing", {
                code: "NOT_NULL_VIOLATION",
                details: [
                    {
                        field,
                        message: err.message || "A required field cannot be null.",
                    },
                ],
            });
        }

        case "22P02": {
            return new ApiError(StatusCodes.BAD_REQUEST, "Invalid input format", {
                code: "INVALID_INPUT_SYNTAX",
                details: [
                    {
                        field,
                        message: err.message || "One or more values have an invalid format.",
                    },
                ],
            });
        }

        case "23514": {
            return new ApiError(StatusCodes.BAD_REQUEST, "Input violates database rule", {
                code: "CHECK_CONSTRAINT_VIOLATION",
                details: [
                    {
                        field,
                        message: err.detail || err.message || "Check constraint failed.",
                        code: err.constraint,
                    },
                ],
            });
        }

        default:
            return null;
    }
}

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

    const mappedError = getErrorChain(err)
        .map((candidate) => mapKnownError(candidate))
        .find((candidate): candidate is ApiError => Boolean(candidate));
    if (mappedError) {
        return res.status(mappedError.statusCode).json({
            success: false,
            error: {
                code: mappedError.code,
                message: mappedError.message,
                details: mappedError.details,
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