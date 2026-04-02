import { Router } from "express";

import {
	loginStudentController,
	registerStudentController,
	refreshStudentTokenController,
	createStudentController,
	deleteStudentController,
	getStudentByIdController,
	getStudentsController,
	updateStudentController,
} from "../../controllers/students.controller.js";
import { restrictToAdminOnly } from "../../middlewares/restrictedToAdmin.js";
import { uploadStudentPhoto } from "../../middlewares/upload.middleware.js";

const studentsRouter = Router();

studentsRouter.post("/register", uploadStudentPhoto, registerStudentController);
studentsRouter.post("/login", loginStudentController);
studentsRouter.post("/refresh", refreshStudentTokenController);

// Everything else is admin-controlled
studentsRouter.use(restrictToAdminOnly);

studentsRouter.post("/", uploadStudentPhoto, createStudentController);
studentsRouter.get("/", getStudentsController);
studentsRouter.get("/:id", getStudentByIdController);
studentsRouter.patch("/:id", uploadStudentPhoto, updateStudentController);
studentsRouter.delete("/:id", deleteStudentController);

export default studentsRouter;
