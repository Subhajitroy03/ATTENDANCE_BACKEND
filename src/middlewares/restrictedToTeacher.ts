import { verifyRoleAccessToken } from "../utils/jwt.js";
import { ApiError } from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import type { Request, Response, NextFunction } from "express";

export const restrictToTeacherOnly = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.cookies?.uid ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Authentication required");
    }

    const teacher = verifyRoleAccessToken(token, "teacher");
    req.teacher = teacher;
    next();
  } catch (error) {
    next(error);
  }
};
