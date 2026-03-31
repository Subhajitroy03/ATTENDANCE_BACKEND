import { Router } from "express";

import {
	createDepartmentController,
	deleteDepartmentController,
	getDepartmentByIdController,
	getDepartmentsController,
	updateDepartmentController,
} from "../../controllers/departments.controller.js";

const departmentsRouter = Router();

departmentsRouter.post("/", createDepartmentController);
departmentsRouter.get("/", getDepartmentsController);
departmentsRouter.get("/:id", getDepartmentByIdController);
departmentsRouter.patch("/:id", updateDepartmentController);
departmentsRouter.delete("/:id", deleteDepartmentController);

export default departmentsRouter;
