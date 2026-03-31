import { Router } from "express";
import { restrictToAdminOnly } from "../../middlewares/restrictedToAdmin.js";

import {
	createDepartmentController,
	deleteDepartmentController,
	getDepartmentByIdController,
	getDepartmentsController,
	updateDepartmentController,
} from "../../controllers/departments.controller.js";

const departmentsRouter = Router();

departmentsRouter.use(restrictToAdminOnly);

departmentsRouter.post("/", createDepartmentController);
departmentsRouter.get("/", getDepartmentsController);
departmentsRouter.get("/:id", getDepartmentByIdController);
departmentsRouter.patch("/:id", updateDepartmentController);
departmentsRouter.delete("/:id", deleteDepartmentController);

export default departmentsRouter;
