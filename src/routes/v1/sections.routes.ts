import { Router } from "express";
import { restrictToAdminOnly } from "../../middlewares/restrictedToAdmin.js";

import {
	createSectionController,
	deleteSectionController,
	getSectionByIdController,
	getSectionsController,
	updateSectionController,
} from "../../controllers/sections.controller.js";

const sectionsRouter = Router();

sectionsRouter.use(restrictToAdminOnly);

sectionsRouter.post("/", createSectionController);
sectionsRouter.get("/", getSectionsController);
sectionsRouter.get("/:id", getSectionByIdController);
sectionsRouter.patch("/:id", updateSectionController);
sectionsRouter.delete("/:id", deleteSectionController);

export default sectionsRouter;
