import { z } from "zod";

export const assignmentCreateSchema = z.object({
  catechistId: z.string().uuid("Mã giáo lý viên không hợp lệ"),
  role: z.enum(["PRIMARY", "ASSISTANT"]).default("PRIMARY"),
  note: z.string().trim().optional().nullable(),
});
