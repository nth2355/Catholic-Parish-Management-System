import { z } from "zod";

const optionalText = z.preprocess(
  (value) => (value === "" ? null : value),
  z.string().trim().min(1).optional().nullable(),
);

export const academicYearCreateSchema = z.object({
  name: z.string().trim().min(1, "Tên năm học không được để trống"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: z.enum(["ACTIVE", "CLOSED"]).optional(),
});

export const classCreateSchema = z.object({
  name: z.string().trim().min(1, "Tên lớp không được để trống"),
  level: z.enum(["TIM_HIEU", "XUNG_TOI", "RUOC_LE", "THEM_SUC"]),
  capacity: z.coerce.number().int().min(1).max(200).default(30),
  room: optionalText,
  dayOfWeek: z.coerce.number().int().min(0).max(6).optional().nullable(),
  startTime: optionalText,
  endTime: optionalText,
  status: z.enum(["ACTIVE", "PAUSED", "COMPLETED"]).optional(),
  academicYearId: z.string().uuid("Năm học không hợp lệ"),
});

export const classUpdateSchema = classCreateSchema.partial();

export const classListQuerySchema = z.object({
  search: z.string().trim().optional(),
  level: z.enum(["TIM_HIEU", "XUNG_TOI", "RUOC_LE", "THEM_SUC"]).optional(),
  status: z.enum(["ACTIVE", "PAUSED", "COMPLETED"]).optional(),
  academicYearId: z.string().uuid().optional(),
});
