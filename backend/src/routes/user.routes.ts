import { Router } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/me", authenticate, (req: AuthRequest, res) => {
  res.json({
    success: true,
    message: "Token hợp lệ",
    user: req.user,
  });
});

export default router;
