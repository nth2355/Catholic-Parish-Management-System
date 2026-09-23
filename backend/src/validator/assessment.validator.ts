import { z } from "zod";

const optionalUuid = z.string().uuid().optional().nullable();

export const assessmentCreateSchema = z.object({
  academicYearId: z.string().uuid("Năm học không hợp lệ"),
  classId: optionalUuid,
  name: z.string().trim().min(1, "Tên bài đánh giá không được để trống"),
  type: z.enum(["WRITTEN", "ORAL", "PRACTICAL", "OTHER"]),
  assessmentDate: z.coerce.date(),
  maxScore: z.coerce.number().positive().max(100),
  status: z.enum(["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
});

export const assessmentUpdateSchema = assessmentCreateSchema.partial();

export const assessmentListQuerySchema = z.object({
  academicYearId: z.string().uuid().optional(),
  classId: z.string().uuid().optional(),
  status: z.enum(["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
});

export const gradeUpsertSchema = z.object({
  grades: z.array(
    z.object({
      studentId: z.string().uuid("Học sinh không hợp lệ"),
      score: z.coerce.number().min(0).max(100).nullable().optional(),
      conduct: z
        .enum(["EXCELLENT", "GOOD", "AVERAGE", "NEEDS_IMPROVEMENT"])
        .nullable()
        .optional(),
      comment: z.string().trim().max(500).nullable().optional(),
    }),
  ),
});
