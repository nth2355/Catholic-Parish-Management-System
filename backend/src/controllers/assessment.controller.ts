import type { Request, Response } from "express";
import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../db/prisma.js";
import {
  assessmentCreateSchema,
  assessmentListQuerySchema,
  assessmentUpdateSchema,
  gradeUpsertSchema,
} from "../validator/assessment.validator.js";

const assessmentInclude = {
  class: { select: { id: true, name: true } },
  academicYear: { select: { id: true, name: true } },
  _count: { select: { grades: true } },
} satisfies Prisma.AssessmentInclude;

function getId(req: Request) {
  return typeof req.params.id === "string" ? req.params.id : undefined;
}

export async function listAssessments(req: Request, res: Response) {
  const result = assessmentListQuerySchema.safeParse(req.query);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Tham số bài đánh giá không hợp lệ",
      errors: result.error.flatten().fieldErrors,
    });
  }

  try {
    const where = Object.fromEntries(
      Object.entries(result.data).filter(([, value]) => value !== undefined),
    ) as Prisma.AssessmentWhereInput;
    const assessments = await prisma.assessment.findMany({
      where,
      orderBy: { assessmentDate: "desc" },
      include: assessmentInclude,
    });
    return res.json({ success: true, data: assessments });
  } catch (error) {
    console.error("List assessments error:", error);
    return res.status(500).json({ success: false, message: "Không thể tải bài đánh giá" });
  }
}

export async function createAssessment(req: Request, res: Response) {
  const result = assessmentCreateSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu bài đánh giá không hợp lệ",
      errors: result.error.flatten().fieldErrors,
    });
  }

  try {
    const assessment = await prisma.assessment.create({
      data: result.data as Prisma.AssessmentUncheckedCreateInput,
      include: assessmentInclude,
    });
    return res.status(201).json({ success: true, data: assessment });
  } catch (error) {
    console.error("Create assessment error:", error);
    return res.status(409).json({
      success: false,
      message: "Không thể tạo bài đánh giá; hãy kiểm tra năm học và lớp học",
    });
  }
}

export async function updateAssessment(req: Request, res: Response) {
  const id = getId(req);
  const result = assessmentUpdateSchema.safeParse(req.body);
  if (!id) return res.status(400).json({ success: false, message: "Mã bài đánh giá không hợp lệ" });
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu bài đánh giá không hợp lệ",
      errors: result.error.flatten().fieldErrors,
    });
  }

  try {
    const assessment = await prisma.assessment.update({
      where: { id },
      data: result.data as Prisma.AssessmentUncheckedUpdateInput,
      include: assessmentInclude,
    });
    return res.json({ success: true, data: assessment });
  } catch (error) {
    console.error("Update assessment error:", error);
    return res.status(404).json({ success: false, message: "Không tìm thấy bài đánh giá" });
  }
}

export async function deleteAssessment(req: Request, res: Response) {
  const id = getId(req);
  if (!id) return res.status(400).json({ success: false, message: "Mã bài đánh giá không hợp lệ" });
  try {
    await prisma.assessment.delete({ where: { id } });
    return res.json({ success: true, message: "Đã xóa bài đánh giá" });
  } catch (error) {
    console.error("Delete assessment error:", error);
    return res.status(409).json({ success: false, message: "Không thể xóa bài đánh giá" });
  }
}

export async function listAssessmentGrades(req: Request, res: Response) {
  const assessmentId = getId(req);
  if (!assessmentId) return res.status(400).json({ success: false, message: "Mã bài đánh giá không hợp lệ" });
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        ...assessmentInclude,
        grades: {
          orderBy: { student: { fullName: "asc" } },
          include: { student: true },
        },
      },
    });
    if (!assessment) return res.status(404).json({ success: false, message: "Không tìm thấy bài đánh giá" });
    const students = assessment.classId
      ? await prisma.student.findMany({
          where: {
            status: "ACTIVE",
            enrollments: { some: { classId: assessment.classId, status: "ACTIVE" } },
          },
          orderBy: { fullName: "asc" },
          select: { id: true, fullName: true, baptismalName: true },
        })
      : [];
    const grades = students.map((student) => ({
      student,
      ...(assessment.grades.find((grade) => grade.studentId === student.id) ?? {
        id: null,
        score: null,
        conduct: null,
        comment: null,
      }),
    }));
    return res.json({ success: true, data: { ...assessment, grades } });
  } catch (error) {
    console.error("List assessment grades error:", error);
    return res.status(500).json({ success: false, message: "Không thể tải điểm số" });
  }
}

export async function saveAssessmentGrades(req: Request, res: Response) {
  const assessmentId = getId(req);
  const result = gradeUpsertSchema.safeParse(req.body);
  if (!assessmentId) return res.status(400).json({ success: false, message: "Mã bài đánh giá không hợp lệ" });
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu điểm số không hợp lệ",
      errors: result.error.flatten().fieldErrors,
    });
  }

  try {
    const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } });
    if (!assessment) return res.status(404).json({ success: false, message: "Không tìm thấy bài đánh giá" });

    const studentIds = result.data.grades.map((grade) => grade.studentId);
    const students = await prisma.student.findMany({
      where: {
        id: { in: studentIds },
        ...(assessment.classId
          ? { enrollments: { some: { classId: assessment.classId, status: "ACTIVE" } } }
          : {}),
      },
      select: { id: true },
    });
    if (students.length !== new Set(studentIds).size) {
      return res.status(400).json({ success: false, message: "Có học sinh không thuộc lớp của bài đánh giá" });
    }

    await prisma.$transaction(
      result.data.grades.map((grade) =>
          prisma.grade.upsert({
          where: { assessmentId_studentId: { assessmentId, studentId: grade.studentId } },
            create: {
              assessmentId,
              studentId: grade.studentId,
              score: grade.score ?? null,
              conduct: grade.conduct ?? null,
              comment: grade.comment ?? null,
            },
            update: { score: grade.score ?? null, conduct: grade.conduct ?? null, comment: grade.comment ?? null },
          }),
        ),
    );
    const updated = await prisma.assessment.findUnique({
        where: { id: assessmentId },
        include: {
          ...assessmentInclude,
          grades: {
            orderBy: { student: { fullName: "asc" } },
            include: { student: true },
          },
        },
    });
    if (!updated) return res.status(404).json({ success: false, message: "Không tìm thấy bài đánh giá" });
    const updatedStudents = updated.classId
      ? await prisma.student.findMany({
          where: {
            status: "ACTIVE",
            enrollments: { some: { classId: updated.classId, status: "ACTIVE" } },
          },
          orderBy: { fullName: "asc" },
          select: { id: true, fullName: true, baptismalName: true },
        })
      : [];
    const updatedGrades = updatedStudents.map((student) => ({
      student,
      ...(updated.grades.find((grade) => grade.studentId === student.id) ?? {
        id: null,
        score: null,
        conduct: null,
        comment: null,
      }),
    }));
    return res.json({ success: true, data: { ...updated, grades: updatedGrades } });
  } catch (error) {
    console.error("Save assessment grades error:", error);
    return res.status(500).json({ success: false, message: "Không thể lưu điểm số" });
  }
}
