import type { Request, Response } from "express";
import { prisma } from "../db/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";
import {
  academicYearCreateSchema,
  classCreateSchema,
  classListQuerySchema,
  classUpdateSchema,
} from "../validator/class.validator.js";

export async function listAcademicYears(_req: Request, res: Response) {
  try {
    const years = await prisma.academicYear.findMany({
      orderBy: { startDate: "desc" },
    });
    return res.json({ success: true, data: years });
  } catch (error) {
    console.error("List academic years error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Không thể tải năm học" });
  }
}

export async function createAcademicYear(req: Request, res: Response) {
  const result = academicYearCreateSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu năm học không hợp lệ",
      errors: result.error.flatten().fieldErrors,
    });
  }

  if (result.data.endDate <= result.data.startDate) {
    return res
      .status(400)
      .json({ success: false, message: "Ngày kết thúc phải sau ngày bắt đầu" });
  }

  try {
    const data = Object.fromEntries(
      Object.entries(result.data).filter(([, value]) => value !== undefined),
    ) as unknown as Prisma.AcademicYearCreateInput;
    const year = await prisma.academicYear.create({ data });
    return res.status(201).json({ success: true, data: year });
  } catch (error) {
    console.error("Create academic year error:", error);
    return res
      .status(409)
      .json({ success: false, message: "Tên năm học đã tồn tại" });
  }
}

export async function listClasses(req: Request, res: Response) {
  const query = classListQuerySchema.safeParse(req.query);
  if (!query.success) {
    return res.status(400).json({
      success: false,
      message: "Tham số lớp học không hợp lệ",
      errors: query.error.flatten().fieldErrors,
    });
  }

  const { search, level, status, academicYearId } = query.data;
  const where: Prisma.ClassWhereInput = {
    ...(level ? { level } : {}),
    ...(status ? { status } : {}),
    ...(academicYearId ? { academicYearId } : {}),
    ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
  };

  try {
    const classes = await prisma.class.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        academicYear: true,
        _count: { select: { enrollments: true } },
        assignments: {
          where: { status: "ACTIVE" },
          include: {
            catechist: {
              select: { id: true, fullName: true, baptismalName: true },
            },
          },
        },
      },
    });
    return res.json({ success: true, data: classes });
  } catch (error) {
    console.error("List classes error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Không thể tải danh sách lớp" });
  }
}

export async function getClass(req: Request, res: Response) {
  const classId = typeof req.params.id === "string" ? req.params.id : undefined;
  if (!classId)
    return res
      .status(400)
      .json({ success: false, message: "Mã lớp không hợp lệ" });

  try {
    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        academicYear: true,
        enrollments: { include: { student: true } },
        _count: { select: { enrollments: true } },
      },
    });
    if (!classRecord)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy lớp học" });
    return res.json({ success: true, data: classRecord });
  } catch (error) {
    console.error("Get class error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Không thể tải thông tin lớp" });
  }
}

export async function createClass(req: Request, res: Response) {
  const result = classCreateSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu lớp học không hợp lệ",
      errors: result.error.flatten().fieldErrors,
    });
  }

  try {
    const data = Object.fromEntries(
      Object.entries(result.data).filter(([, value]) => value !== undefined),
    ) as unknown as Prisma.ClassCreateInput;
    const classRecord = await prisma.class.create({ data });
    return res.status(201).json({ success: true, data: classRecord });
  } catch (error) {
    console.error("Create class error:", error);
    return res.status(409).json({
      success: false,
      message: "Tên lớp đã tồn tại trong năm học hoặc năm học không tồn tại",
    });
  }
}

export async function updateClass(req: Request, res: Response) {
  const result = classUpdateSchema.safeParse(req.body);
  const classId = typeof req.params.id === "string" ? req.params.id : undefined;
  if (!classId)
    return res
      .status(400)
      .json({ success: false, message: "Mã lớp không hợp lệ" });
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu lớp học không hợp lệ",
      errors: result.error.flatten().fieldErrors,
    });
  }

  try {
    const data = Object.fromEntries(
      Object.entries(result.data).filter(([, value]) => value !== undefined),
    ) as Prisma.ClassUpdateInput;
    const classRecord = await prisma.class.update({
      where: { id: classId },
      data,
    });
    return res.json({ success: true, data: classRecord });
  } catch (error) {
    console.error("Update class error:", error);
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy lớp học" });
  }
}

export async function deleteClass(req: Request, res: Response) {
  const classId = typeof req.params.id === "string" ? req.params.id : undefined;
  if (!classId)
    return res
      .status(400)
      .json({ success: false, message: "Mã lớp không hợp lệ" });

  try {
    await prisma.class.delete({ where: { id: classId } });
    return res.json({ success: true, message: "Đã xóa lớp học" });
  } catch (error) {
    console.error("Delete class error:", error);
    return res.status(409).json({
      success: false,
      message: "Không thể xóa lớp đang có dữ liệu liên quan",
    });
  }
}
