import { Router } from "express";

import {
	createTeacherController,
	deleteTeacherController,
	getTeacherByIdController,
	getTeachersController,
	updateTeacherController,
} from "../../controllers/teachers.controller.js";

const teachersRouter = Router();

teachersRouter.post("/", createTeacherController);
teachersRouter.get("/", getTeachersController);
teachersRouter.get("/:id", getTeacherByIdController);
teachersRouter.patch("/:id", updateTeacherController);
teachersRouter.delete("/:id", deleteTeacherController);

export default teachersRouter;
