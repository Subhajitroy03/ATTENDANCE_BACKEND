import { Router } from "express";

import {
	createAdminController,
	deleteAdminController,
	getAdminByIdController,
	getAdminsController,
	loginAdminController,
	refreshAdminTokenController,
	updateAdminController,
	verifyStudentController,
	verifyTeacherController,
} from "../../controllers/admins.controller.js";
import { restrictToAdminOnly } from "../../middlewares/restrictedToAdmin.js";

const adminsRouter = Router();
adminsRouter.post("/login", loginAdminController);
adminsRouter.post("/refresh", refreshAdminTokenController);
adminsRouter.post("/", createAdminController);
adminsRouter.use(restrictToAdminOnly);

adminsRouter.get("/", getAdminsController);
adminsRouter.get("/:id", getAdminByIdController);
adminsRouter.patch("/:id", updateAdminController);
adminsRouter.delete("/:id", deleteAdminController);

adminsRouter.patch(
	"/teachers/:teacherId/verify",
	verifyTeacherController
);

adminsRouter.patch(
	"/students/:studentId/verify",
	verifyStudentController
);

export default adminsRouter;
