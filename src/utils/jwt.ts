import jwt from "jsonwebtoken";
import { ApiError } from "./ApiError.js";
import { StatusCodes } from "http-status-codes";

export type AuthRole = "admin" | "teacher" | "student";

export interface BaseAuthPayload {
    id: string;
    email: string;
    role: AuthRole;
}

export interface AdminPayload extends BaseAuthPayload {
    role: "admin";
}

export interface TeacherPayload extends BaseAuthPayload {
    role: "teacher";
}

export interface StudentPayload extends BaseAuthPayload {
    role: "student";
}

export type UserPayload = TeacherPayload | StudentPayload;

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";

function getAccessSecret(): string {
    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) {
        throw new Error("JWT_SECRET_KEY is not configured");
    }
    return secret;
}

function getRefreshSecret(): string {
    return process.env.JWT_REFRESH_SECRET_KEY || getAccessSecret();
}

export function generateAccessToken(admin: AdminPayload): string {
    return jwt.sign(admin, getAccessSecret(), {
        expiresIn: ACCESS_TOKEN_EXPIRY,
    });
}

export function generateRefreshToken(admin: AdminPayload): string {
    return jwt.sign(admin, getRefreshSecret(), {
        expiresIn: REFRESH_TOKEN_EXPIRY,
    });
}

export function generateTokenPair(admin: AdminPayload): TokenPair {
    return {
        accessToken: generateAccessToken(admin),
        refreshToken: generateRefreshToken(admin),
    };
}

function assertRole<T extends AuthRole>(
    payload: BaseAuthPayload,
    expectedRole: T
): asserts payload is Extract<BaseAuthPayload, { role: T }> {
    if (payload.role !== expectedRole) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid token role");
    }
}

export function verifyAccessToken(token: string): AdminPayload {
    try {
        const payload = jwt.verify(token, getAccessSecret()) as BaseAuthPayload;
        assertRole(payload, "admin");
        return payload as AdminPayload;
    } catch (err: any) {
        const isExpired = err?.name === "TokenExpiredError";
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            isExpired ? "Session expired. Please login again." : "Invalid session. Please login again."
        );
    }
}

export function verifyRefreshToken(token: string): AdminPayload {
    try {
        const payload = jwt.verify(token, getRefreshSecret()) as BaseAuthPayload;
        assertRole(payload, "admin");
        return payload as AdminPayload;
    } catch (err: any) {
        const isExpired = err?.name === "TokenExpiredError";
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            isExpired ? "Session expired. Please login again." : "Invalid session. Please login again."
        );
    }
}

export function setadmin(admin: Omit<AdminPayload, "role">): string {
    return generateAccessToken({ ...admin, role: "admin" });
}
export function getadmin(token: string): AdminPayload {
    return verifyAccessToken(token);
}

export function generateUserAccessToken(user: UserPayload): string {
    return jwt.sign(user, getAccessSecret(), {
        expiresIn: ACCESS_TOKEN_EXPIRY,
    });
}

export function generateUserRefreshToken(user: UserPayload): string {
    return jwt.sign(user, getRefreshSecret(), {
        expiresIn: REFRESH_TOKEN_EXPIRY,
    });
}

export function generateUserTokenPair(user: UserPayload): TokenPair {
    return {
        accessToken: generateUserAccessToken(user),
        refreshToken: generateUserRefreshToken(user),
    };
}

export function verifyUserAccessToken(token: string): UserPayload {
    try {
        const payload = jwt.verify(token, getAccessSecret()) as BaseAuthPayload;
        if (payload.role !== "teacher" && payload.role !== "student") {
            throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid token role");
        }
        return payload as UserPayload;
    } catch (err: any) {
        const isExpired = err?.name === "TokenExpiredError";
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            isExpired ? "Session expired. Please login again." : "Invalid session. Please login again."
        );
    }
}

export function verifyUserRefreshToken(token: string): UserPayload {
    try {
        const payload = jwt.verify(token, getRefreshSecret()) as BaseAuthPayload;
        if (payload.role !== "teacher" && payload.role !== "student") {
            throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid token role");
        }
        return payload as UserPayload;
    } catch (err: any) {
        const isExpired = err?.name === "TokenExpiredError";
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            isExpired ? "Session expired. Please login again." : "Invalid session. Please login again."
        );
    }
}

export function verifyRoleAccessToken<T extends AuthRole>(
    token: string,
    role: T
): T extends "admin" ? AdminPayload : T extends "teacher" ? TeacherPayload : StudentPayload {
    try {
        const payload = jwt.verify(token, getAccessSecret()) as BaseAuthPayload;
        if (payload.role !== role) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid token role");
        }
        return payload as any;
    } catch (err: any) {
        if (err instanceof ApiError) {
            throw err;
        }

        const isExpired = err?.name === "TokenExpiredError";
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            isExpired ? "Session expired. Please login again." : "Invalid session. Please login again."
        );
    }
}
