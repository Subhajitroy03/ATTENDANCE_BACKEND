import { Router } from "express";
import { restrictToAdminOnly } from "../../middlewares/restrictedToAdmin.js";

import {
	createSubjectTeacherController,
	deleteSubjectTeacherController,
	getSubjectTeacherByIdController,
	getSubjectTeachersController,
	updateSubjectTeacherController,
} from "../../controllers/subject-teachers.controller.js";

const subjectTeachersRouter = Router();

subjectTeachersRouter.use(restrictToAdminOnly);

subjectTeachersRouter.post("/", createSubjectTeacherController);
subjectTeachersRouter.get("/", getSubjectTeachersController);
subjectTeachersRouter.get("/:id", getSubjectTeacherByIdController);
subjectTeachersRouter.patch("/:id", updateSubjectTeacherController);
subjectTeachersRouter.delete("/:id", deleteSubjectTeacherController);

export default subjectTeachersRouter;
