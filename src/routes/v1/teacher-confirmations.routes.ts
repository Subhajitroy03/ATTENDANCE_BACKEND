import { Router } from "express";

import {
	createTeacherConfirmationController,
	deleteTeacherConfirmationController,
	getTeacherConfirmationByIdController,
	getTeacherConfirmationsController,
	updateTeacherConfirmationController,
} from "../../controllers/teacher-confirmations.controller.js";

const teacherConfirmationsRouter = Router();

teacherConfirmationsRouter.post("/", createTeacherConfirmationController);
teacherConfirmationsRouter.get("/", getTeacherConfirmationsController);
teacherConfirmationsRouter.get("/:id", getTeacherConfirmationByIdController);
teacherConfirmationsRouter.patch("/:id", updateTeacherConfirmationController);
teacherConfirmationsRouter.delete("/:id", deleteTeacherConfirmationController);

export default teacherConfirmationsRouter;
