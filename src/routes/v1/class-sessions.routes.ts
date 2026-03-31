import { Router } from "express";
import { restrictToAdminOnly } from "../../middlewares/restrictedToAdmin.js";

import {
	createClassSessionController,
	deleteClassSessionController,
	getClassSessionByIdController,
	getClassSessionsController,
	updateClassSessionController,
} from "../../controllers/class-sessions.controller.js";

const classSessionsRouter = Router();

classSessionsRouter.use(restrictToAdminOnly);

classSessionsRouter.post("/", createClassSessionController);
classSessionsRouter.get("/", getClassSessionsController);
classSessionsRouter.get("/:id", getClassSessionByIdController);
classSessionsRouter.patch("/:id", updateClassSessionController);
classSessionsRouter.delete("/:id", deleteClassSessionController);

export default classSessionsRouter;
