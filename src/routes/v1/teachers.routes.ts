import { Router } from "express";

import {
	loginTeacherController,
	registerTeacherController,
	refreshTeacherTokenController,
	createTeacherController,
	deleteTeacherController,
	getTeacherByIdController,
	getTeachersController,
	updateTeacherController,
} from "../../controllers/teachers.controller.js";
import { restrictToAdminOnly } from "../../middlewares/restrictedToAdmin.js";

const teachersRouter = Router();

teachersRouter.post("/register", registerTeacherController);
teachersRouter.post("/login", loginTeacherController);
teachersRouter.post("/refresh", refreshTeacherTokenController);

// Everything else is admin-controlled
teachersRouter.use(restrictToAdminOnly);

teachersRouter.post("/", createTeacherController);
teachersRouter.get("/", getTeachersController);
teachersRouter.get("/:id", getTeacherByIdController);
teachersRouter.patch("/:id", updateTeacherController);
teachersRouter.delete("/:id", deleteTeacherController);

export default teachersRouter;
