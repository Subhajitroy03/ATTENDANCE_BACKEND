import { StatusCodes } from "http-status-codes";

import { ApiError } from "./ApiError.js";

export const AOT_EMAIL_DOMAIN = "@aot.edu.in";

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const isAotEduEmail = (email: string): boolean => {
	const normalized = normalizeEmail(email);
	return normalized.endsWith(AOT_EMAIL_DOMAIN);
};

export const assertAotEduEmail = (email: string): void => {
	if (!isAotEduEmail(email)) {
		throw new ApiError(
			StatusCodes.BAD_REQUEST,
			`Email must end with ${AOT_EMAIL_DOMAIN}`
		);
	}
};
