import { Router } from "express";
import { restrictToAdminOnly } from "../../middlewares/restrictedToAdmin.js";

import {
	createRoomController,
	deleteRoomController,
	getRoomByIdController,
	getRoomsController,
	updateRoomController,
} from "../../controllers/rooms.controller.js";

const roomsRouter = Router();

roomsRouter.use(restrictToAdminOnly);

roomsRouter.post("/", createRoomController);
roomsRouter.get("/", getRoomsController);
roomsRouter.get("/:id", getRoomByIdController);
roomsRouter.patch("/:id", updateRoomController);
roomsRouter.delete("/:id", deleteRoomController);

export default roomsRouter;
