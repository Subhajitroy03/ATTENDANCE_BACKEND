import type { ZodIssue } from "zod";
import type { ApiErrorDetail } from "./ApiError.js";

export const formatZodIssues = (issues: ZodIssue[]): ApiErrorDetail[] => {
    return issues.map((issue) => {
        const field = issue.path.length ? issue.path.join(".") : undefined;

        return {
            ...(field ? { field } : {}),
            message: issue.message,
            code: issue.code,
        };
    });
};
