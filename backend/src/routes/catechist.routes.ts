import { Router } from "express";
import {
  createCatechist,
  deleteCatechist,
  getCatechist,
  listCatechists,
  updateCatechist,
} from "../controllers/catechist.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router();
router.use(authenticate);
router.get("/", listCatechists);
router.get("/:id", getCatechist);
router.post("/", requireRole("ADMIN"), createCatechist);
router.patch("/:id", requireRole("ADMIN"), updateCatechist);
router.delete("/:id", requireRole("ADMIN"), deleteCatechist);

export default router;
