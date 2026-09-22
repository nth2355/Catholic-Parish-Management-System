import { Router } from "express";
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

export default router;
