import { Router } from "express";
import {
  createAssignment,
  deleteAssignment,
  listAssignments,
} from "../controllers/assignment.controller.js";
import {
  createAcademicYear,
  createClass,
  deleteClass,
  getClass,
  listAcademicYears,
  listClasses,
  updateClass,
} from "../controllers/class.controller.js";
import {
  enrollStudent,
  listClassEnrollments,
  removeEnrollment,
  updateEnrollment,
} from "../controllers/enrollment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router();
router.use(authenticate);
router.get("/academic-years", listAcademicYears);
router.post("/academic-years", requireRole("ADMIN"), createAcademicYear);
router.get("/", listClasses);
router.get("/:id", getClass);
router.post("/", requireRole("ADMIN"), createClass);
router.patch("/:id", requireRole("ADMIN"), updateClass);
router.delete("/:id", requireRole("ADMIN"), deleteClass);
router.get("/:classId/students", listClassEnrollments);
router.post("/:classId/students", requireRole("ADMIN"), enrollStudent);
router.patch(
  "/:classId/students/:studentId",
  requireRole("ADMIN"),
  updateEnrollment,
);
router.delete(
  "/:classId/students/:studentId",
  requireRole("ADMIN"),
  removeEnrollment,
);
router.get("/:classId/assignments", listAssignments);
router.post("/:classId/assignments", requireRole("ADMIN"), createAssignment);
router.delete(
  "/:classId/assignments/:assignmentId",
  requireRole("ADMIN"),
  deleteAssignment,
);

export default router;
