import { Router } from "express";
import { restrictToAdminOnly } from "../../middlewares/restrictedToAdmin.js";

import {
	createTimetableSlotController,
	deleteTimetableSlotController,
	getTimetableSlotByIdController,
	getTimetableSlotsController,
	updateTimetableSlotController,
} from "../../controllers/timetable.controller.js";

const timetableRouter = Router();

timetableRouter.use(restrictToAdminOnly);

timetableRouter.post("/", createTimetableSlotController);
timetableRouter.get("/", getTimetableSlotsController);
timetableRouter.get("/:id", getTimetableSlotByIdController);
timetableRouter.patch("/:id", updateTimetableSlotController);
timetableRouter.delete("/:id", deleteTimetableSlotController);

export default timetableRouter;
