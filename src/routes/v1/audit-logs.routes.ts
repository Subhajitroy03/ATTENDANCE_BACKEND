import { Router } from "express";
import { restrictToAdminOnly } from "../../middlewares/restrictedToAdmin.js";

import {
	createAuditLogController,
	deleteAuditLogController,
	getAuditLogByIdController,
	getAuditLogsController,
	updateAuditLogController,
} from "../../controllers/audit-logs.controller.js";

const auditLogsRouter = Router();

auditLogsRouter.use(restrictToAdminOnly);

auditLogsRouter.post("/", createAuditLogController);
auditLogsRouter.get("/", getAuditLogsController);
auditLogsRouter.get("/:id", getAuditLogByIdController);
auditLogsRouter.patch("/:id", updateAuditLogController);
auditLogsRouter.delete("/:id", deleteAuditLogController);

export default auditLogsRouter;
