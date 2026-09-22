import { z } from "zod";

const optionalText = z.preprocess(
  (value) => (value === "" ? null : value),
  z.string().trim().min(1).optional().nullable(),
);
const optionalEmail = z.preprocess(
  (value) => (value === "" ? null : value),
  z.string().email("Email phụ huynh không hợp lệ").optional().nullable(),
);

export const studentCreateSchema = z.object({
  studentCode: optionalText,
  fullName: z.string().trim().min(1, "Họ và tên không được để trống"),
  baptismalName: z.string().trim().min(1, "Tên thánh không được để trống"),
  dateOfBirth: z.coerce.date(),
  gender: z.enum(["MALE", "FEMALE"]),
  guardianName: optionalText,
  guardianPhone: optionalText,
  guardianEmail: optionalEmail,
  address: optionalText,
  status: z.enum(["ACTIVE", "INACTIVE", "GRADUATED"]).optional(),
});

export const studentUpdateSchema = studentCreateSchema.partial();

export const studentListQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "GRADUATED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type StudentCreateInput = z.infer<typeof studentCreateSchema>;
export type StudentUpdateInput = z.infer<typeof studentUpdateSchema>;
