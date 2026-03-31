import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { swapsService } from "../services/swaps.service.js";
import { ApiError } from "../utils/ApiError.js";
import { formatZodIssues } from "../utils/validation.js";
import { createSwapSchema, listSwapsQuerySchema, updateSwapSchema } from "../validators/swaps.validator.js";

export const createSwapController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = createSwapSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const swap = await swapsService.createSwap(parsed.data);

		return res.status(StatusCodes.CREATED).json({
			success: true,
			message: "Swap created successfully",
			data: swap,
		});
	} catch (error) {
		next(error);
	}
};

export const getSwapsController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = listSwapsQuerySchema.safeParse(req.query);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const swaps = await swapsService.getSwaps(parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Swaps fetched successfully",
			data: swaps,
		});
	} catch (error) {
		next(error);
	}
};

export const getSwapByIdController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const swap = await swapsService.getSwapById(id);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Swap fetched successfully",
			data: swap,
		});
	} catch (error) {
		next(error);
	}
};

export const updateSwapController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const parsed = updateSwapSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const swap = await swapsService.updateSwap(id, parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Swap updated successfully",
			data: swap,
		});
	} catch (error) {
		next(error);
	}
};

export const deleteSwapController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const swap = await swapsService.deleteSwap(id);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Swap deleted successfully",
			data: swap,
		});
	} catch (error) {
		next(error);
	}
};

// Backward-compatible export (some files may import this symbol).
export const swapsController = {
	createSwapController,
	getSwapsController,
	getSwapByIdController,
	updateSwapController,
	deleteSwapController,
};
