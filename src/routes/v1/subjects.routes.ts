import { Router } from "express";

import {
	createSubjectController,
	deleteSubjectController,
	getSubjectByIdController,
	getSubjectsController,
	updateSubjectController,
} from "../../controllers/subjects.controller.js";

const subjectsRouter = Router();

subjectsRouter.post("/", createSubjectController);
subjectsRouter.get("/", getSubjectsController);
subjectsRouter.get("/:id", getSubjectByIdController);
subjectsRouter.patch("/:id", updateSubjectController);
subjectsRouter.delete("/:id", deleteSubjectController);

export default subjectsRouter;
