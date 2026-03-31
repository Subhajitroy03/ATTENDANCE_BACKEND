import { Router } from "express";

import { restrictToStudentOnly } from "../../middlewares/restrictedToStudent.js";
import { restrictToAdminOnly } from "../../middlewares/restrictedToAdmin.js";

import {
	createAttendanceController,
	deleteAttendanceController,
	getAttendanceByIdController,
	getAttendanceController,
	getMySubjectAttendanceSummaryController,
	updateAttendanceController,
} from "../../controllers/attendance.controller.js";

const attendanceRouter = Router();
attendanceRouter.get(
	"/my-summary",
	restrictToStudentOnly,
	getMySubjectAttendanceSummaryController
);

// Everything else is admin-controlled
attendanceRouter.use(restrictToAdminOnly);

attendanceRouter.post("/", createAttendanceController);
attendanceRouter.get("/", getAttendanceController);
attendanceRouter.get("/:id", getAttendanceByIdController);
attendanceRouter.patch("/:id", updateAttendanceController);
attendanceRouter.delete("/:id", deleteAttendanceController);

export default attendanceRouter;
