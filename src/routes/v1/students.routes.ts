import { Router } from "express";

import {
	createStudentController,
	deleteStudentController,
	getStudentByIdController,
	getStudentsController,
	updateStudentController,
} from "../../controllers/students.controller.js";

const studentsRouter = Router();

studentsRouter.post("/", createStudentController);
studentsRouter.get("/", getStudentsController);
studentsRouter.get("/:id", getStudentByIdController);
studentsRouter.patch("/:id", updateStudentController);
studentsRouter.delete("/:id", deleteStudentController);

export default studentsRouter;
