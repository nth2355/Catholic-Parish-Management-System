import type { Request, Response } from "express";
import { prisma } from "../db/prisma.js";
import { attendanceBatchSchema } from "../validator/attendance.validator.js";

function getSessionId(req: Request) {
  return typeof req.params.sessionId === "string"
    ? req.params.sessionId
    : undefined;
}

export async function listSessionAttendance(req: Request, res: Response) {
  const sessionId = getSessionId(req);
  if (!sessionId)
    return res
      .status(400)
      .json({ success: false, message: "Mã buổi học không hợp lệ" });

  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        class: {
          include: {
            enrollments: {
              where: { status: "ACTIVE" },
              include: { student: true },
              orderBy: { student: { fullName: "asc" } },
            },
          },
        },
        attendances: true,
      },
    });
    if (!session)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy buổi học" });

    const attendanceByStudent = new Map(
      session.attendances.map((record) => [record.studentId, record]),
    );
    const students = session.class.enrollments.map(({ student }) => ({
      student,
      attendance: attendanceByStudent.get(student.id) ?? null,
    }));
    return res.json({ success: true, data: { session, students } });
  } catch (error) {
    console.error("List attendance error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Không thể tải danh sách điểm danh" });
  }
}

export async function saveSessionAttendance(req: Request, res: Response) {
  const sessionId = getSessionId(req);
  const result = attendanceBatchSchema.safeParse(req.body);
  if (!sessionId)
    return res
      .status(400)
      .json({ success: false, message: "Mã buổi học không hợp lệ" });
  if (!result.success)
    return res
      .status(400)
      .json({
        success: false,
        message: "Dữ liệu điểm danh không hợp lệ",
        errors: result.error.flatten().fieldErrors,
      });

  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        class: { include: { enrollments: { where: { status: "ACTIVE" } } } },
      },
    });
    if (!session)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy buổi học" });

    const enrolledIds = new Set(
      session.class.enrollments.map((enrollment) => enrollment.studentId),
    );
    if (
      result.data.records.some((record) => !enrolledIds.has(record.studentId))
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Có học sinh không thuộc lớp của buổi học",
        });
    }

    await prisma.$transaction(
      result.data.records.map((record) =>
        prisma.attendance.upsert({
          where: {
            sessionId_studentId: { sessionId, studentId: record.studentId },
          },
          create: {
            sessionId,
            studentId: record.studentId,
            status: record.status,
            note: record.note ?? null,
          },
          update: {
            status: record.status,
            note: record.note ?? null,
            markedAt: new Date(),
          },
        }),
      ),
    );
    await prisma.session.update({
      where: { id: sessionId },
      data: { status: "COMPLETED" },
    });
    return res.json({ success: true, message: "Đã lưu điểm danh" });
  } catch (error) {
    console.error("Save attendance error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Không thể lưu điểm danh" });
  }
}
