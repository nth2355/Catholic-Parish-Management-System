import { Router } from "express";
import {
  listSessionAttendance,
  saveSessionAttendance,
} from "../controllers/attendance.controller.js";
import {
  createSession,
  deleteSession,
  getSession,
  listSessions,
  updateSession,
} from "../controllers/session.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router();
router.use(authenticate);
router.get("/", listSessions);
router.get("/:id", getSession);
router.post("/", requireRole("ADMIN"), createSession);
router.patch("/:id", requireRole("ADMIN"), updateSession);
router.delete("/:id", requireRole("ADMIN"), deleteSession);
router.get("/:sessionId/attendance", listSessionAttendance);
router.put("/:sessionId/attendance", saveSessionAttendance);

export default router;
