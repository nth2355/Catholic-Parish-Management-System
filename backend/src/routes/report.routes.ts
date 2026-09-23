import { Router } from "express";
import { getReportSummary } from "../controllers/report.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(authenticate);
router.get("/summary", getReportSummary);

export default router;
