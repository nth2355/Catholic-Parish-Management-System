import type { NextFunction, Response } from "express";
import type { AuthRequest, AuthUser } from "./auth.middleware.js";

export function requireRole(...allowedRoles: AuthUser["role"][]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền thực hiện thao tác này",
      });
    }

    next();
  };
}
