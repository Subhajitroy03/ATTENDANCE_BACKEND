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

const studentsRouter = Router();

studentsRouter.post("/register", registerStudentController);
studentsRouter.post("/login", loginStudentController);
studentsRouter.post("/refresh", refreshStudentTokenController);

// Everything else is admin-controlled
studentsRouter.use(restrictToAdminOnly);

studentsRouter.post("/", createStudentController);
studentsRouter.get("/", getStudentsController);
studentsRouter.get("/:id", getStudentByIdController);
studentsRouter.patch("/:id", updateStudentController);
studentsRouter.delete("/:id", deleteStudentController);

export default studentsRouter;
