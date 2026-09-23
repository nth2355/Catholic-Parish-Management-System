import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../db/prisma.js";
import type { LoginInput } from "../validator/auth.validator.js";

export class AuthenticationError extends Error {}

export async function login(input: LoginInput) {
  const user = await prisma.userAccount.findUnique({
    where: {
      email: input.email,
    },
    include: {
      catechist: {
        select: {
          fullName: true,
          baptismalName: true,
        },
      },
    },
  });

  if (!user) {
    throw new AuthenticationError("Email hoặc mật khẩu không đúng");
  }

  if (!user.isActive) {
    throw new AuthenticationError("Tài khoản đã bị khóa");
  }

  const isPasswordValid = await bcrypt.compare(
    input.password,
    user.passwordHash,
  );

  if (!isPasswordValid) {
    throw new AuthenticationError("Email hoặc mật khẩu không đúng");
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET chưa được cấu hình");
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    secret,
    {
      expiresIn: "1h",
    },
  );

  await prisma.userAccount.update({
    where: {
      id: user.id,
    },
    data: {
      lastLoginAt: new Date(),
    },
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.catechist?.fullName ?? null,
      baptismalName: user.catechist?.baptismalName ?? null,
    },
  };
}
