import { Router } from "express";
import { restrictToAdminOnly } from "../../middlewares/restrictedToAdmin.js";

import {
	createNotificationController,
	deleteNotificationController,
	getNotificationByIdController,
	getNotificationsController,
	updateNotificationController,
} from "../../controllers/notifications.controller.js";

const notificationsRouter = Router();

notificationsRouter.use(restrictToAdminOnly);

notificationsRouter.post("/", createNotificationController);
notificationsRouter.get("/", getNotificationsController);
notificationsRouter.get("/:id", getNotificationByIdController);
notificationsRouter.patch("/:id", updateNotificationController);
notificationsRouter.delete("/:id", deleteNotificationController);

export default notificationsRouter;
