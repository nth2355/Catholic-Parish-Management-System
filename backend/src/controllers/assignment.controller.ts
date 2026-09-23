import type { Request, Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { prisma } from "../db/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";
import { assignmentCreateSchema } from "../validator/assignment.validator.js";
import { classTeachingScope } from "../utils/catechist-scope.js";

function getClassId(req: Request) {
  return typeof req.params.classId === "string"
    ? req.params.classId
    : undefined;
}

export async function listAssignments(req: AuthRequest, res: Response) {
  const classId = getClassId(req);
  if (!classId)
    return res
      .status(400)
      .json({ success: false, message: "Mã lớp không hợp lệ" });
  try {
    const assignments = await prisma.teachingAssignment.findMany({
      where: { classId, status: "ACTIVE", class: classTeachingScope(req) },
      orderBy: [{ role: "asc" }, { catechist: { fullName: "asc" } }],
      include: { catechist: true },
    });
    return res.json({ success: true, data: assignments });
  } catch (error) {
    console.error("List assignments error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Không thể tải phân công lớp" });
  }
}

export async function createAssignment(req: Request, res: Response) {
  const classId = getClassId(req);
  const result = assignmentCreateSchema.safeParse(req.body);
  if (!classId)
    return res
      .status(400)
      .json({ success: false, message: "Mã lớp không hợp lệ" });
  if (!result.success)
    return res.status(400).json({
      success: false,
      message: "Dữ liệu phân công không hợp lệ",
      errors: result.error.flatten().fieldErrors,
    });

  try {
    const data = Object.fromEntries(
      Object.entries({ classId, ...result.data }).filter(
        ([, value]) => value !== undefined,
      ),
    ) as unknown as Prisma.TeachingAssignmentCreateInput;
    const assignment = await prisma.teachingAssignment.create({
      data,
      include: { catechist: true },
    });
    return res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    console.error("Create assignment error:", error);
    return res.status(409).json({
      success: false,
      message:
        "Giáo lý viên đã được phân công với vai trò này hoặc không tồn tại",
    });
  }
}

export async function deleteAssignment(req: Request, res: Response) {
  const classId = getClassId(req);
  const assignmentId =
    typeof req.params.assignmentId === "string"
      ? req.params.assignmentId
      : undefined;
  if (!classId || !assignmentId)
    return res
      .status(400)
      .json({ success: false, message: "Mã phân công không hợp lệ" });
  try {
    await prisma.teachingAssignment.updateMany({
      where: { id: assignmentId, classId },
      data: { status: "ENDED", endedAt: new Date() },
    });
    return res.json({ success: true, message: "Đã kết thúc phân công" });
  } catch (error) {
    console.error("Delete assignment error:", error);
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy phân công" });
  }
}
