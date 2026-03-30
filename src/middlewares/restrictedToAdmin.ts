import { verifyAccessToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';
import { StatusCodes } from 'http-status-codes';
import type { Request, Response, NextFunction } from 'express';
export const restrictToAdminOnly = (req:Request, res:Response, next:NextFunction) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.cookies?.uid ||
            req.headers.authorization?.split(" ")[1];
        if (!token) {
            throw new ApiError(
                StatusCodes.UNAUTHORIZED,
                "Authentication required",
            );
        }

        const admin = verifyAccessToken(token);
        req.admin = admin;
        next();
    } catch (error) {
        next(error);
    }
};