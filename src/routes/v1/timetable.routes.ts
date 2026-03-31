import { Router } from "express";

import {
	createTimetableSlotController,
	deleteTimetableSlotController,
	getTimetableSlotByIdController,
	getTimetableSlotsController,
	updateTimetableSlotController,
} from "../../controllers/timetable.controller.js";

const timetableRouter = Router();

timetableRouter.post("/", createTimetableSlotController);
timetableRouter.get("/", getTimetableSlotsController);
timetableRouter.get("/:id", getTimetableSlotByIdController);
timetableRouter.patch("/:id", updateTimetableSlotController);
timetableRouter.delete("/:id", deleteTimetableSlotController);

export default timetableRouter;
