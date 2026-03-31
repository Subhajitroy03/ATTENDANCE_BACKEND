import { Router } from "express";

import {
	createAttendanceController,
	deleteAttendanceController,
	getAttendanceByIdController,
	getAttendanceController,
	updateAttendanceController,
} from "../../controllers/attendance.controller.js";

const attendanceRouter = Router();

attendanceRouter.post("/", createAttendanceController);
attendanceRouter.get("/", getAttendanceController);
attendanceRouter.get("/:id", getAttendanceByIdController);
attendanceRouter.patch("/:id", updateAttendanceController);
attendanceRouter.delete("/:id", deleteAttendanceController);

export default attendanceRouter;
