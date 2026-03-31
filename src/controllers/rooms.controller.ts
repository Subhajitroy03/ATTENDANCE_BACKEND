import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { roomsService } from "../services/rooms.service.js";
import { ApiError } from "../utils/ApiError.js";
import { formatZodIssues } from "../utils/validation.js";
import {
	createRoomSchema,
	listRoomsQuerySchema,
	updateRoomSchema,
} from "../validators/rooms.validator.js";

export const createRoomController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = createRoomSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const room = await roomsService.createRoom(parsed.data);

		return res.status(StatusCodes.CREATED).json({
			success: true,
			message: "Room created successfully",
			data: room,
		});
	} catch (error) {
		next(error);
	}
};

export const getRoomsController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = listRoomsQuerySchema.safeParse(req.query);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const rooms = await roomsService.getRooms(parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Rooms fetched successfully",
			data: rooms,
		});
	} catch (error) {
		next(error);
	}
};

export const getRoomByIdController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const room = await roomsService.getRoomById(id);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Room fetched successfully",
			data: room,
		});
	} catch (error) {
		next(error);
	}
};

export const updateRoomController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const parsed = updateRoomSchema.safeParse(req.body);
		if (!parsed.success) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", {
				code: "VALIDATION_ERROR",
				details: formatZodIssues(parsed.error.issues),
			});
		}

		const room = await roomsService.updateRoom(id, parsed.data);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Room updated successfully",
			data: room,
		});
	} catch (error) {
		next(error);
	}
};

export const deleteRoomController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = String(req.params.id ?? "");
		if (!id) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "id is required");
		}

		const room = await roomsService.deleteRoom(id);

		return res.status(StatusCodes.OK).json({
			success: true,
			message: "Room deleted successfully",
			data: room,
		});
	} catch (error) {
		next(error);
	}
};

// Backward-compatible export (some files may import this symbol).
export const roomsController = {
	createRoomController,
	getRoomsController,
	getRoomByIdController,
	updateRoomController,
	deleteRoomController,
};
