import type { Request, Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { prisma } from "../db/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";
import {
  enrollmentCreateSchema,
  enrollmentUpdateSchema,
} from "../validator/enrollment.validator.js";
import { classTeachingScope } from "../utils/catechist-scope.js";

function getClassId(req: Request) {
  return typeof req.params.classId === "string"
    ? req.params.classId
    : undefined;
}

export async function listClassEnrollments(req: AuthRequest, res: Response) {
  const classId = getClassId(req);
  if (!classId)
    return res
      .status(400)
      .json({ success: false, message: "Mã lớp không hợp lệ" });

  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { classId, class: classTeachingScope(req) },
      orderBy: { student: { fullName: "asc" } },
      include: { student: true },
    });
    return res.json({ success: true, data: enrollments });
  } catch (error) {
    console.error("List enrollments error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể tải danh sách học sinh trong lớp",
    });
  }
}

export async function enrollStudent(req: Request, res: Response) {
  const classId = getClassId(req);
  const result = enrollmentCreateSchema.safeParse(req.body);
  if (!classId)
    return res
      .status(400)
      .json({ success: false, message: "Mã lớp không hợp lệ" });
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu ghi danh không hợp lệ",
      errors: result.error.flatten().fieldErrors,
    });
  }

  try {
    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
    });
    if (!classRecord)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy lớp học" });

    const activeCount = await prisma.enrollment.count({
      where: { classId, status: "ACTIVE" },
    });
    if (activeCount >= classRecord.capacity) {
      return res
        .status(409)
        .json({ success: false, message: "Lớp đã đủ sĩ số" });
    }

    const data = Object.fromEntries(
      Object.entries({ classId, ...result.data }).filter(
        ([, value]) => value !== undefined,
      ),
    ) as unknown as Prisma.EnrollmentCreateInput;
    const enrollment = await prisma.enrollment.create({
      data,
      include: { student: true },
    });
    return res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    console.error("Enroll student error:", error);
    return res.status(409).json({
      success: false,
      message: "Học sinh đã có trong lớp hoặc mã học sinh không tồn tại",
    });
  }
}

export async function updateEnrollment(req: Request, res: Response) {
  const classId = getClassId(req);
  const studentId =
    typeof req.params.studentId === "string" ? req.params.studentId : undefined;
  const result = enrollmentUpdateSchema.safeParse(req.body);
  if (!classId || !studentId)
    return res
      .status(400)
      .json({ success: false, message: "Mã ghi danh không hợp lệ" });
  if (!result.success)
    return res.status(400).json({
      success: false,
      message: "Trạng thái ghi danh không hợp lệ",
      errors: result.error.flatten().fieldErrors,
    });

  try {
    const data = Object.fromEntries(
      Object.entries(result.data).filter(([, value]) => value !== undefined),
    ) as unknown as Prisma.EnrollmentUpdateInput;
    const enrollment = await prisma.enrollment.update({
      where: { studentId_classId: { studentId, classId } },
      data,
      include: { student: true },
    });
    return res.json({ success: true, data: enrollment });
  } catch (error) {
    console.error("Update enrollment error:", error);
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy ghi danh" });
  }
}

export async function removeEnrollment(req: Request, res: Response) {
  const classId = getClassId(req);
  const studentId =
    typeof req.params.studentId === "string" ? req.params.studentId : undefined;
  if (!classId || !studentId)
    return res
      .status(400)
      .json({ success: false, message: "Mã ghi danh không hợp lệ" });

  try {
    await prisma.enrollment.delete({
      where: { studentId_classId: { studentId, classId } },
    });
    return res.json({ success: true, message: "Đã xóa học sinh khỏi lớp" });
  } catch (error) {
    console.error("Remove enrollment error:", error);
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy ghi danh" });
  }
}
