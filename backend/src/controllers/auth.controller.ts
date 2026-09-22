import type { Request, Response } from "express";
import * as authService from "../services/auth.service.js";
import { loginSchema } from "../validator/auth.validator.js";

export async function login(req: Request, res: Response) {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu đăng nhập không hợp lệ",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const data = await authService.login(result.data);

    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data,
    });
  } catch (error) {
    console.error("Login error:", error);

    const statusCode = error instanceof authService.AuthenticationError ? 401 : 500;
    const message =
      error instanceof authService.AuthenticationError
        ? error.message
        : "Đã xảy ra lỗi máy chủ";

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
}
