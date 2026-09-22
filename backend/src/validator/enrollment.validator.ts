import { z } from "zod";

export const enrollmentCreateSchema = z.object({
  studentId: z.string().uuid("Mã học sinh không hợp lệ"),
  status: z.enum(["ACTIVE", "ON_LEAVE", "COMPLETED", "WITHDRAWN"]).optional(),
  note: z.string().trim().optional().nullable(),
});

export const enrollmentUpdateSchema = z.object({
  status: z.enum(["ACTIVE", "ON_LEAVE", "COMPLETED", "WITHDRAWN"]),
  note: z.string().trim().optional().nullable(),
});
