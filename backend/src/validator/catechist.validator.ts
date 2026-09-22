import { z } from "zod";

const optionalText = z.preprocess(
  (value) => (value === "" ? null : value),
  z.string().trim().min(1).optional().nullable(),
);
const optionalEmail = z.preprocess(
  (value) => (value === "" ? null : value),
  z.string().email("Email không hợp lệ").optional().nullable(),
);

export const catechistCreateSchema = z.object({
  fullName: z.string().trim().min(1, "Họ và tên không được để trống"),
  baptismalName: optionalText,
  dateOfBirth: z.coerce.date().optional().nullable(),
  phone: optionalText,
  email: optionalEmail,
  joinedAt: z.coerce.date().optional().nullable(),
  status: z.enum(["NEW", "PROBATION", "ACTIVE", "INACTIVE"]).optional(),
});

export const catechistUpdateSchema = catechistCreateSchema.partial();

export const catechistListQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(["NEW", "PROBATION", "ACTIVE", "INACTIVE"]).optional(),
});
