import { Router } from "express";

import { restrictToStudentOnly } from "../../middlewares/restrictedToStudent.js";
import { restrictToAdminOnly } from "../../middlewares/restrictedToAdmin.js";
import { restrictToTeacherOnly } from "../../middlewares/restrictedToTeacher.js";

import {
	createAttendanceController,
	deleteAttendanceController,
	getAttendanceByIdController,
	getAttendanceController,
	getMySubjectAttendanceSummaryController,
	updateAttendanceController,
	getMyTaughtClassesAttendanceController,
	getMyClassTeacherClassesAttendanceController,
	updateAttendanceAsTeacherController,
} from "../../controllers/attendance.controller.js";

const attendanceRouter = Router();

// Student routes
attendanceRouter.get(
	"/my-summary",
	restrictToStudentOnly,
	getMySubjectAttendanceSummaryController
);

// Teacher routes
attendanceRouter.get(
	"/teacher/my-taught-classes",
	restrictToTeacherOnly,
	getMyTaughtClassesAttendanceController
);

attendanceRouter.get(
	"/teacher/my-class-teacher-classes",
	restrictToTeacherOnly,
	getMyClassTeacherClassesAttendanceController
);

attendanceRouter.patch(
	"/teacher/:id",
	restrictToTeacherOnly,
	updateAttendanceAsTeacherController
);

// Everything else is admin-controlled
attendanceRouter.use(restrictToAdminOnly);

attendanceRouter.post("/", createAttendanceController);
attendanceRouter.get("/", getAttendanceController);
attendanceRouter.get("/:id", getAttendanceByIdController);
attendanceRouter.patch("/:id", updateAttendanceController);
attendanceRouter.delete("/:id", deleteAttendanceController);

export default attendanceRouter;
