import { Router } from "express";

import adminsRouter from "./admins.routes.js";
import auditLogsRouter from "./audit-logs.routes.js";
import attendanceRouter from "./attendance.routes.js";
import departmentsRouter from "./departments.routes.js";
import notificationsRouter from "./notifications.routes.js";
import roomsRouter from "./rooms.routes.js";
import sectionsRouter from "./sections.routes.js";
import classSessionsRouter from "./class-sessions.routes.js";
import sectionRoomsRouter from "./section-rooms.routes.js";
import studentsRouter from "./students.routes.js";
import subjectTeachersRouter from "./subject-teachers.routes.js";
import subjectsRouter from "./subjects.routes.js";
import teachersRouter from "./teachers.routes.js";
import teacherConfirmationsRouter from "./teacher-confirmations.routes.js";
import timetableRouter from "./timetable.routes.js";
import swapsRouter from "./swaps.routes.js";

const v1Router = Router();

v1Router.use("/admins", adminsRouter);
v1Router.use("/audit-logs", auditLogsRouter);
v1Router.use("/attendance", attendanceRouter);
v1Router.use("/departments", departmentsRouter);
v1Router.use("/notifications", notificationsRouter);
v1Router.use("/rooms", roomsRouter);
v1Router.use("/sections", sectionsRouter);
v1Router.use("/class-sessions", classSessionsRouter);
v1Router.use("/section-rooms", sectionRoomsRouter);
v1Router.use("/students", studentsRouter);
v1Router.use("/subject-teachers", subjectTeachersRouter);
v1Router.use("/subjects", subjectsRouter);
v1Router.use("/teachers", teachersRouter);
v1Router.use("/teacher-confirmations", teacherConfirmationsRouter);
v1Router.use("/timetable", timetableRouter);
v1Router.use("/swaps", swapsRouter);

export default v1Router;
