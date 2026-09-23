import { z } from "zod";

export const attendanceStatusSchema = z.enum([
  "PRESENT",
  "ABSENT",
  "LATE",
  "EXCUSED",
]);

export const attendanceBatchSchema = z.object({
  records: z
    .array(
      z.object({
        studentId: z.string().uuid("Mã học sinh không hợp lệ"),
        status: attendanceStatusSchema,
        note: z.string().trim().optional().nullable(),
      }),
    )
    .min(1, "Danh sách điểm danh không được trống"),
});
