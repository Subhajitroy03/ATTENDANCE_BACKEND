import { Router } from "express";

import {
	createStudentFaceController,
	deleteStudentFaceController,
	getStudentFaceByIdController,
	getStudentFacesController,
	updateStudentFaceController,
} from "../../controllers/student-faces.controller.js";

const studentFacesRouter = Router();

studentFacesRouter.post("/", createStudentFaceController);
studentFacesRouter.get("/", getStudentFacesController);
studentFacesRouter.get("/:id", getStudentFaceByIdController);
studentFacesRouter.patch("/:id", updateStudentFaceController);
studentFacesRouter.delete("/:id", deleteStudentFaceController);

export default studentFacesRouter;
