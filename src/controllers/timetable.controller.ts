import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { timetableService } from "../services/timetable.service.js";
import { ApiError } from "../utils/ApiError.js";
import { formatZodIssues } from "../utils/validation.js";
import {
	createTimetableSlotSchema,
	listTimetableSlotsQuerySchema,
	updateTimetableSlotSchema,
} from "../validators/timetable.validator.js";

export const createTimetableSlotController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = createTimetableSlotSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const slot = await timetableService.createTimetableSlot(parsed.data);

		return res.status(StatusCodes.CREATED).json({
			success: true,
			message: "Timetable slot created successfully",
			data: slot,
		});
	} catch (error) {
		next(error);
	}
};

export const getTimetableSlotsController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = listTimetableSlotsQuerySchema.safeParse(req.query);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const slots = await timetableService.getTimetableSlots(parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Timetable slots fetched successfully",
			data: slots,
		});
	} catch (error) {
		next(error);
	}
};

export const getTimetableSlotByIdController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const slot = await timetableService.getTimetableSlotById(id);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Timetable slot fetched successfully",
			data: slot,
		});
	} catch (error) {
		next(error);
	}
};

export const updateTimetableSlotController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const parsed = updateTimetableSlotSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const slot = await timetableService.updateTimetableSlot(id, parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Timetable slot updated successfully",
			data: slot,
		});
	} catch (error) {
		next(error);
	}
};

export const deleteTimetableSlotController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const slot = await timetableService.deleteTimetableSlot(id);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Timetable slot deleted successfully",
			data: slot,
		});
	} catch (error) {
		next(error);
	}
};

// Backward-compatible export (some files may import this symbol).
export const timetableController = {
	createTimetableSlotController,
	getTimetableSlotsController,
	getTimetableSlotByIdController,
	updateTimetableSlotController,
	deleteTimetableSlotController,
};
