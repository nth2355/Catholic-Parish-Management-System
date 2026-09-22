import type { Request, Response } from "express";
import { prisma } from "../db/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";
import {
  studentCreateSchema,
  studentListQuerySchema,
  studentUpdateSchema,
} from "../validator/student.validator.js";

export async function listStudents(req: Request, res: Response) {
  const query = studentListQuerySchema.safeParse(req.query);

  if (!query.success) {
    return res.status(400).json({
      success: false,
      message: "Tham số tìm kiếm không hợp lệ",
      errors: query.error.flatten().fieldErrors,
    });
  }

  const { search, status, page, limit } = query.data;
  const where = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { fullName: { contains: search, mode: "insensitive" as const } },
            {
              baptismalName: { contains: search, mode: "insensitive" as const },
            },
            { studentCode: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
  const skip = (page - 1) * limit;

  try {
    const [students, total] = await prisma.$transaction([
      prisma.student.findMany({
        where,
        orderBy: { fullName: "asc" },
        skip,
        take: limit,
        include: {
          enrollments: {
            where: { status: "ACTIVE" },
            include: { class: { select: { id: true, name: true } } },
            take: 1,
          },
        },
      }),
      prisma.student.count({ where }),
    ]);

    return res.json({
      success: true,
      data: students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List students error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Không thể tải danh sách học sinh" });
  }
}

export async function getStudent(req: Request, res: Response) {
  try {
    const studentId =
      typeof req.params.id === "string" ? req.params.id : undefined;

    if (!studentId) {
      return res
        .status(400)
        .json({ success: false, message: "Mã học sinh không hợp lệ" });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy học sinh" });
    }

    return res.json({ success: true, data: student });
  } catch (error) {
    console.error("Get student error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Không thể tải thông tin học sinh" });
  }
}

export async function createStudent(req: Request, res: Response) {
  const result = studentCreateSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu học sinh không hợp lệ",
      errors: result.error.flatten().fieldErrors,
    });
  }

  try {
    const data: Prisma.StudentCreateInput = {
      fullName: result.data.fullName,
      gender: result.data.gender,
      ...(result.data.studentCode !== undefined && {
        studentCode: result.data.studentCode,
      }),
      ...(result.data.baptismalName !== undefined && {
        baptismalName: result.data.baptismalName,
      }),
      ...(result.data.dateOfBirth !== undefined && {
        dateOfBirth: result.data.dateOfBirth,
      }),
      ...(result.data.guardianName !== undefined && {
        guardianName: result.data.guardianName,
      }),
      ...(result.data.guardianPhone !== undefined && {
        guardianPhone: result.data.guardianPhone,
      }),
      ...(result.data.guardianEmail !== undefined && {
        guardianEmail: result.data.guardianEmail,
      }),
      ...(result.data.address !== undefined && {
        address: result.data.address,
      }),
      ...(result.data.status !== undefined && { status: result.data.status }),
    };
    const student = await prisma.student.create({ data });
    return res.status(201).json({ success: true, data: student });
  } catch (error) {
    console.error("Create student error:", error);
    return res.status(409).json({
      success: false,
      message: "Không thể tạo học sinh. Mã học sinh có thể đã tồn tại.",
    });
  }
}

export async function updateStudent(req: Request, res: Response) {
  const result = studentUpdateSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu học sinh không hợp lệ",
      errors: result.error.flatten().fieldErrors,
    });
  }

  const studentId =
    typeof req.params.id === "string" ? req.params.id : undefined;

  if (!studentId) {
    return res
      .status(400)
      .json({ success: false, message: "Mã học sinh không hợp lệ" });
  }

  try {
    const data = Object.fromEntries(
      Object.entries(result.data).filter(([, value]) => value !== undefined),
    ) as Prisma.StudentUpdateInput;
    const student = await prisma.student.update({
      where: { id: studentId },
      data,
    });

    return res.json({ success: true, data: student });
  } catch (error) {
    console.error("Update student error:", error);
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy học sinh" });
  }
}

export async function deleteStudent(req: Request, res: Response) {
  try {
    const studentId =
      typeof req.params.id === "string" ? req.params.id : undefined;

    if (!studentId) {
      return res
        .status(400)
        .json({ success: false, message: "Mã học sinh không hợp lệ" });
    }

    await prisma.student.delete({ where: { id: studentId } });
    return res.json({ success: true, message: "Đã xóa học sinh" });
  } catch (error) {
    console.error("Delete student error:", error);
    return res.status(409).json({
      success: false,
      message:
        "Không thể xóa học sinh này. Học sinh có thể đang có dữ liệu liên quan.",
    });
  }
}
