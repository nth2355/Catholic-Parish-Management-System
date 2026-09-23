import { Router } from "express";
import {
  createAssessment,
  deleteAssessment,
  listAssessmentGrades,
  listAssessments,
  saveAssessmentGrades,
  updateAssessment,
} from "../controllers/assessment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router();
router.use(authenticate);
router.get("/", listAssessments);
router.post("/", requireRole("ADMIN"), createAssessment);
router.patch("/:id", requireRole("ADMIN"), updateAssessment);
router.delete("/:id", requireRole("ADMIN"), deleteAssessment);
router.get("/:id/grades", listAssessmentGrades);
router.put("/:id/grades", requireRole("ADMIN"), saveAssessmentGrades);

export default router;
