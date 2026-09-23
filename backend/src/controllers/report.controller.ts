import type { Request, Response } from "express";
import { prisma } from "../db/prisma.js";

export async function getReportSummary(_req: Request, res: Response) {
  try {
    const [studentCount, classRecords, sessions] = await Promise.all([
      prisma.student.count({ where: { status: "ACTIVE" } }),
      prisma.class.findMany({
        where: { status: { not: "COMPLETED" } },
        orderBy: { name: "asc" },
        include: {
          enrollments: { where: { status: "ACTIVE" }, select: { studentId: true } },
          sessions: {
            select: {
              attendances: { select: { status: true } },
            },
          },
          assessments: {
            select: { grades: { where: { score: { not: null } }, select: { score: true } } },
          },
          assignments: {
            where: { status: "ACTIVE" },
            select: { catechist: { select: { id: true, fullName: true, baptismalName: true } } },
          },
        },
      }),
      prisma.session.findMany({
        select: {
          sessionDate: true,
          attendances: { select: { status: true } },
        },
        orderBy: { sessionDate: "asc" },
      }),
    ]);

    const classReports = classRecords.map((classRecord) => {
      const attendanceRecords = classRecord.sessions.flatMap((session) => session.attendances);
      const presentRecords = attendanceRecords.filter((record) => record.status === "PRESENT" || record.status === "LATE");
      const scores = classRecord.assessments.flatMap((assessment) => assessment.grades.map((grade) => Number(grade.score)));
      return {
        id: classRecord.id,
        name: classRecord.name,
        enrolled: classRecord.enrollments.length,
        attendance: attendanceRecords.length ? Math.round((presentRecords.length / attendanceRecords.length) * 1000) / 10 : 0,
        avg: scores.length ? Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100) / 100 : 0,
        sessions: classRecord.sessions.length,
        catechists: classRecord.assignments.map((assignment) => assignment.catechist),
      };
    });

    const attendanceValues = classReports.filter((report) => report.attendance > 0).map((report) => report.attendance);
    const gradeValues = classReports.filter((report) => report.avg > 0).map((report) => report.avg);
    const catechists = classReports.flatMap((report) => report.catechists.map((catechist) => ({
      ...catechist,
      className: report.name,
      sessions: report.sessions,
      attendance: report.attendance,
      avgGrade: report.avg,
    })));
    const monthly = new Map<string, { attendance: number; total: number }>();
    for (const session of sessions) {
      const month = new Date(session.sessionDate).toISOString().slice(0, 7);
      const current = monthly.get(month) ?? { attendance: 0, total: 0 };
      current.total += session.attendances.length;
      current.attendance += session.attendances.filter(
        (record) => record.status === "PRESENT" || record.status === "LATE",
      ).length;
      monthly.set(month, current);
    }
    const monthlyAttendance = [...monthly.entries()].map(([month, value]) => ({
      month,
      attendance: value.total
        ? Math.round((value.attendance / value.total) * 1000) / 10
        : 0,
    }));

    return res.json({
      success: true,
      data: {
        students: studentCount,
        attendance: attendanceValues.length ? Math.round((attendanceValues.reduce((sum, value) => sum + value, 0) / attendanceValues.length) * 10) / 10 : 0,
        avgGrade: gradeValues.length ? Math.round((gradeValues.reduce((sum, value) => sum + value, 0) / gradeValues.length) * 100) / 100 : 0,
        classes: classReports,
        catechists,
        monthlyAttendance,
      },
    });
  } catch (error) {
    console.error("Get report summary error:", error);
    return res.status(500).json({ success: false, message: "Không thể tải báo cáo thống kê" });
  }
}
