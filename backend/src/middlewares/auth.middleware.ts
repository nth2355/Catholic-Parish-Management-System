import type { NextFunction, Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";

export interface AuthUser {
  userId: string;
  role: "ADMIN" | "CATECHIST";
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

function isAuthPayload(
  payload: string | JwtPayload,
): payload is JwtPayload & AuthUser {
  return (
    typeof payload !== "string" &&
    typeof payload.userId === "string" &&
    (payload.role === "ADMIN" || payload.role === "CATECHIST")
  );
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Chưa đăng nhập hoặc thiếu token",
    });
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ",
    });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({
      success: false,
      message: "JWT_SECRET chưa được cấu hình",
    });
  }

  try {
    const decoded = jwt.verify(token, secret);

    if (!isAuthPayload(decoded)) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn",
    });
  }
}
