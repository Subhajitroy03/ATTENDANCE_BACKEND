import { Router } from "express";

import {
	createNotificationController,
	deleteNotificationController,
	getNotificationByIdController,
	getNotificationsController,
	updateNotificationController,
} from "../../controllers/notifications.controller.js";

const notificationsRouter = Router();

notificationsRouter.post("/", createNotificationController);
notificationsRouter.get("/", getNotificationsController);
notificationsRouter.get("/:id", getNotificationByIdController);
notificationsRouter.patch("/:id", updateNotificationController);
notificationsRouter.delete("/:id", deleteNotificationController);

export default notificationsRouter;
