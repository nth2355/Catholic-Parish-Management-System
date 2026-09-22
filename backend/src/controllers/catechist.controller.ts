import type { Request, Response } from "express";
import { prisma } from "../db/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";
import {
  catechistCreateSchema,
  catechistListQuerySchema,
  catechistUpdateSchema,
} from "../validator/catechist.validator.js";

export async function listCatechists(req: Request, res: Response) {
  const query = catechistListQuerySchema.safeParse(req.query);
  if (!query.success)
    return res
      .status(400)
      .json({ success: false, message: "Tham số giáo lý viên không hợp lệ" });

  const { search, status } = query.data;
  const where: Prisma.CatechistWhereInput = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { fullName: { contains: search, mode: "insensitive" } },
            { baptismalName: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  try {
    const catechists = await prisma.catechist.findMany({
      where,
      orderBy: { fullName: "asc" },
      include: {
        assignments: {
          where: { status: "ACTIVE" },
          include: { class: { select: { id: true, name: true } } },
        },
      },
    });
    return res.json({ success: true, data: catechists });
  } catch (error) {
    console.error("List catechists error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Không thể tải danh sách giáo lý viên",
      });
  }
}

export async function getCatechist(req: Request, res: Response) {
  const id = typeof req.params.id === "string" ? req.params.id : undefined;
  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "Mã giáo lý viên không hợp lệ" });
  try {
    const catechist = await prisma.catechist.findUnique({
      where: { id },
      include: { assignments: { include: { class: true } } },
    });
    if (!catechist)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy giáo lý viên" });
    return res.json({ success: true, data: catechist });
  } catch (error) {
    console.error("Get catechist error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Không thể tải hồ sơ giáo lý viên" });
  }
}

export async function createCatechist(req: Request, res: Response) {
  const result = catechistCreateSchema.safeParse(req.body);
  if (!result.success)
    return res
      .status(400)
      .json({
        success: false,
        message: "Dữ liệu giáo lý viên không hợp lệ",
        errors: result.error.flatten().fieldErrors,
      });
  try {
    const data = Object.fromEntries(
      Object.entries(result.data).filter(([, value]) => value !== undefined),
    ) as unknown as Prisma.CatechistCreateInput;
    const catechist = await prisma.catechist.create({ data });
    return res.status(201).json({ success: true, data: catechist });
  } catch (error) {
    console.error("Create catechist error:", error);
    return res
      .status(409)
      .json({
        success: false,
        message: "Email giáo lý viên có thể đã tồn tại",
      });
  }
}

export async function updateCatechist(req: Request, res: Response) {
  const id = typeof req.params.id === "string" ? req.params.id : undefined;
  const result = catechistUpdateSchema.safeParse(req.body);
  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "Mã giáo lý viên không hợp lệ" });
  if (!result.success)
    return res
      .status(400)
      .json({
        success: false,
        message: "Dữ liệu giáo lý viên không hợp lệ",
        errors: result.error.flatten().fieldErrors,
      });
  try {
    const data = Object.fromEntries(
      Object.entries(result.data).filter(([, value]) => value !== undefined),
    ) as unknown as Prisma.CatechistUpdateInput;
    const catechist = await prisma.catechist.update({ where: { id }, data });
    return res.json({ success: true, data: catechist });
  } catch (error) {
    console.error("Update catechist error:", error);
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy giáo lý viên" });
  }
}

export async function deleteCatechist(req: Request, res: Response) {
  const id = typeof req.params.id === "string" ? req.params.id : undefined;
  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "Mã giáo lý viên không hợp lệ" });
  try {
    await prisma.catechist.delete({ where: { id } });
    return res.json({ success: true, message: "Đã xóa giáo lý viên" });
  } catch (error) {
    console.error("Delete catechist error:", error);
    return res
      .status(409)
      .json({
        success: false,
        message:
          "Không thể xóa giáo lý viên đang có phân công hoặc dữ liệu liên quan",
      });
  }
}
