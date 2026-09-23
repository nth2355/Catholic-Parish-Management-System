import type { Request, Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { prisma } from "../db/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";
import {
  sessionCreateSchema,
  sessionListQuerySchema,
  sessionUpdateSchema,
} from "../validator/session.validator.js";
import { sessionTeachingScope } from "../utils/catechist-scope.js";

const sessionInclude = {
  class: { select: { id: true, name: true } },
  assignment: {
    include: {
      catechist: { select: { id: true, fullName: true, baptismalName: true } },
    },
  },
  _count: { select: { attendances: true } },
} satisfies Prisma.SessionInclude;

export async function listSessions(req: AuthRequest, res: Response) {
  const query = sessionListQuerySchema.safeParse(req.query);
  if (!query.success) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Tham số buổi học không hợp lệ",
        errors: query.error.flatten().fieldErrors,
      });
  }

  const { search, classId, status } = query.data;
  const where: Prisma.SessionWhereInput = {
    ...sessionTeachingScope(req),
    ...(classId ? { classId } : {}),
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { topic: { contains: search, mode: "insensitive" } },
            { class: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  try {
    const sessions = await prisma.session.findMany({
      where,
      orderBy: [{ sessionDate: "desc" }, { startTime: "asc" }],
      include: sessionInclude,
    });
    return res.json({ success: true, data: sessions });
  } catch (error) {
    console.error("List sessions error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Không thể tải danh sách buổi học" });
  }
}

export async function getSession(req: AuthRequest, res: Response) {
  const id = typeof req.params.id === "string" ? req.params.id : undefined;
  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "Mã buổi học không hợp lệ" });
  try {
    const session = await prisma.session.findFirst({
      where: { id, ...sessionTeachingScope(req) },
      include: {
        ...sessionInclude,
        attendances: { include: { student: true } },
      },
    });
    if (!session)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy buổi học" });
    return res.json({ success: true, data: session });
  } catch (error) {
    console.error("Get session error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Không thể tải buổi học" });
  }
}

async function validateSessionRelations(
  classId: string,
  assignmentId?: string | null,
) {
  const classRecord = await prisma.class.findUnique({ where: { id: classId } });
  if (!classRecord) return "Không tìm thấy lớp học";
  if (assignmentId) {
    const assignment = await prisma.teachingAssignment.findFirst({
      where: { id: assignmentId, classId, status: "ACTIVE" },
    });
    if (!assignment) return "Giáo lý viên không được phân công cho lớp này";
  }
  return null;
}

export async function createSession(req: Request, res: Response) {
  const result = sessionCreateSchema.safeParse(req.body);
  if (!result.success)
    return res
      .status(400)
      .json({
        success: false,
        message: "Dữ liệu buổi học không hợp lệ",
        errors: result.error.flatten().fieldErrors,
      });
  if (result.data.endTime <= result.data.startTime)
    return res
      .status(400)
      .json({ success: false, message: "Giờ kết thúc phải sau giờ bắt đầu" });
  const relationError = await validateSessionRelations(
    result.data.classId,
    result.data.assignmentId,
  );
  if (relationError)
    return res.status(400).json({ success: false, message: relationError });

  try {
    const data = Object.fromEntries(
      Object.entries(result.data).filter(([, value]) => value !== undefined),
    ) as unknown as Prisma.SessionCreateInput;
    const session = await prisma.session.create({
      data,
      include: sessionInclude,
    });
    return res.status(201).json({ success: true, data: session });
  } catch (error) {
    console.error("Create session error:", error);
    return res
      .status(409)
      .json({ success: false, message: "Không thể tạo buổi học" });
  }
}

export async function updateSession(req: Request, res: Response) {
  const id = typeof req.params.id === "string" ? req.params.id : undefined;
  const result = sessionUpdateSchema.safeParse(req.body);
  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "Mã buổi học không hợp lệ" });
  if (!result.success)
    return res
      .status(400)
      .json({
        success: false,
        message: "Dữ liệu buổi học không hợp lệ",
        errors: result.error.flatten().fieldErrors,
      });
  if (
    result.data.startTime &&
    result.data.endTime &&
    result.data.endTime <= result.data.startTime
  )
    return res
      .status(400)
      .json({ success: false, message: "Giờ kết thúc phải sau giờ bắt đầu" });
  if (result.data.classId) {
    const relationError = await validateSessionRelations(
      result.data.classId,
      result.data.assignmentId,
    );
    if (relationError)
      return res.status(400).json({ success: false, message: relationError });
  }

  try {
    const data = Object.fromEntries(
      Object.entries(result.data).filter(([, value]) => value !== undefined),
    ) as unknown as Prisma.SessionUpdateInput;
    const session = await prisma.session.update({
      where: { id },
      data,
      include: sessionInclude,
    });
    return res.json({ success: true, data: session });
  } catch (error) {
    console.error("Update session error:", error);
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy buổi học" });
  }
}

export async function deleteSession(req: Request, res: Response) {
  const id = typeof req.params.id === "string" ? req.params.id : undefined;
  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "Mã buổi học không hợp lệ" });
  try {
    await prisma.session.delete({ where: { id } });
    return res.json({ success: true, message: "Đã xóa buổi học" });
  } catch (error) {
    console.error("Delete session error:", error);
    return res
      .status(409)
      .json({
        success: false,
        message: "Không thể xóa buổi học có dữ liệu điểm danh",
      });
  }
}
