import { Router } from "express";
import { restrictToAdminOnly } from "../../middlewares/restrictedToAdmin.js";

import {
	createSectionRoomController,
	deleteSectionRoomController,
	getSectionRoomByIdController,
	getSectionRoomsController,
	updateSectionRoomController,
} from "../../controllers/section-rooms.controller.js";

const sectionRoomsRouter = Router();

sectionRoomsRouter.use(restrictToAdminOnly);

sectionRoomsRouter.post("/", createSectionRoomController);
sectionRoomsRouter.get("/", getSectionRoomsController);
sectionRoomsRouter.get("/:id", getSectionRoomByIdController);
sectionRoomsRouter.patch("/:id", updateSectionRoomController);
sectionRoomsRouter.delete("/:id", deleteSectionRoomController);

export default sectionRoomsRouter;
