import { Router } from "express";

import {
	verifyStudentController,
	verifyTeacherController,
} from "../../controllers/admins.controller.js";
import { restrictToAdminOnly } from "../../middlewares/restrictedToAdmin.js";

const adminsRouter = Router();

adminsRouter.patch(
	"/teachers/:teacherId/verify",
	restrictToAdminOnly,
	verifyTeacherController
);

adminsRouter.patch(
	"/students/:studentId/verify",
	restrictToAdminOnly,
	verifyStudentController
);

export default adminsRouter;
