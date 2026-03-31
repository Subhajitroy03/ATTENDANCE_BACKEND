import { Router } from "express";
import { restrictToAdminOnly } from "../../middlewares/restrictedToAdmin.js";

import {
	createStudentFaceController,
	deleteStudentFaceController,
	getStudentFaceByIdController,
	getStudentFacesController,
	updateStudentFaceController,
} from "../../controllers/student-faces.controller.js";

const studentFacesRouter = Router();

studentFacesRouter.use(restrictToAdminOnly);

studentFacesRouter.post("/", createStudentFaceController);
studentFacesRouter.get("/", getStudentFacesController);
studentFacesRouter.get("/:id", getStudentFaceByIdController);
studentFacesRouter.patch("/:id", updateStudentFaceController);
studentFacesRouter.delete("/:id", deleteStudentFaceController);

export default studentFacesRouter;
