import { z } from "zod";

const optionalText = z.preprocess(
  (value) => (value === "" ? null : value),
  z.string().trim().min(1).optional().nullable(),
);

export const sessionCreateSchema = z.object({
  classId: z.string().uuid("Mã lớp không hợp lệ"),
  assignmentId: z.string().uuid("Phân công không hợp lệ").optional().nullable(),
  topic: z.string().trim().min(1, "Chủ đề không được để trống"),
  sessionDate: z.coerce.date(),
  startTime: z.string().trim().min(1, "Giờ bắt đầu không được để trống"),
  endTime: z.string().trim().min(1, "Giờ kết thúc không được để trống"),
  room: optionalText,
  status: z
    .enum(["UPCOMING", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
    .optional(),
});

export const sessionUpdateSchema = sessionCreateSchema.partial();

export const sessionListQuerySchema = z.object({
  search: z.string().trim().optional(),
  classId: z.string().uuid().optional(),
  status: z
    .enum(["UPCOMING", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
    .optional(),
});
