import { Router } from "express";
import {
  createStudent,
  deleteStudent,
  getStudent,
  listStudents,
  updateStudent,
} from "../controllers/student.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router();

router.use(authenticate);
router.get("/", listStudents);
router.get("/:id", getStudent);
router.post("/", requireRole("ADMIN"), createStudent);
router.patch("/:id", requireRole("ADMIN"), updateStudent);
router.delete("/:id", requireRole("ADMIN"), deleteStudent);

export default router;
