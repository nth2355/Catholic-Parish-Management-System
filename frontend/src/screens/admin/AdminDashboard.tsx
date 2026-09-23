import { useEffect, useState } from "react";
import { StatCard, Card, Badge, Button, ProgressBar, SectionHeader, UsersIcon, BookOpenIcon, CalendarIcon, AwardIcon, CheckCircleIcon, AlertTriangleIcon, TrendingUpIcon } from "../../components/ui";

type AdminScreen = "dashboard" | "students" | "classes" | "catechists" | "sessions" | "assessments" | "reports";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
type DashboardClass = { id: string; name: string; attendance: number; avg: number; enrolled: number; sessions: number; catechists: { fullName: string }[] };
type DashboardSummary = { students: number; attendance: number; avgGrade: number; classes: DashboardClass[]; catechists: unknown[] };
type DashboardSession = { id: string; class: { name: string }; assignment: { catechist: { fullName: string } } | null; sessionDate: string; status: string; _count: { attendances: number } };

export default function AdminDashboard({ onNavigate }: { onNavigate: (s: AdminScreen) => void }) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [sessions, setSessions] = useState<DashboardSession[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  const authUser = JSON.parse(localStorage.getItem("authUser") || sessionStorage.getItem("authUser") || "{}") as {
    email?: string;
    fullName?: string | null;
    baptismalName?: string | null;
  };
  const displayName = authUser.fullName || authUser.baptismalName || authUser.email?.split("@")[0] || "Người dùng";

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/reports/summary`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_BASE_URL}/sessions`, { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(async ([summaryResponse, sessionsResponse]) => {
        const summaryResult = await summaryResponse.json();
        const sessionsResult = await sessionsResponse.json();
        if (!summaryResponse.ok) throw new Error(summaryResult.message || "Không thể tải tổng quan");
        if (!sessionsResponse.ok) throw new Error(sessionsResult.message || "Không thể tải buổi học");
        setSummary(summaryResult.data);
        setSessions(sessionsResult.data.slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, [token]);

  const activeClasses = summary?.classes.length || 0;
  const classDistribution = [
    { label: "Xuất sắc (9–10)", count: summary?.classes.filter((item) => item.avg >= 9).length || 0, color: "green" as const },
    { label: "Tốt (7–8.9)", count: summary?.classes.filter((item) => item.avg >= 7 && item.avg < 9).length || 0, color: "navy" as const },
    { label: "Khá (5–6.9)", count: summary?.classes.filter((item) => item.avg >= 5 && item.avg < 7).length || 0, color: "gold" as const },
    { label: "Cần cải thiện", count: summary?.classes.filter((item) => item.avg > 0 && item.avg < 5).length || 0, color: "red" as const },
  ];

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-warm-400 uppercase tracking-wider mb-1">Tổng quan hệ thống</p>
          <h1 className="text-xl font-bold text-warm-900" style={{ fontFamily: "var(--font-display)" }}>
            Chào buổi sáng, {displayName} ✦
          </h1>
          <p className="text-sm text-warm-500 mt-0.5">{new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date())}</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => onNavigate("sessions")}>
          <CalendarIcon size={13} /> Buổi hôm nay
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Tổng học sinh"
          value={summary?.students ?? "—"}
          sub="Năm học hiện tại"
          icon={<UsersIcon size={18} />}
          color="navy"
        />
        <StatCard
          label="Số lớp học"
          value={activeClasses}
          sub="Lớp đang hoạt động"
          icon={<BookOpenIcon size={18} />}
          color="gold"
        />
        <StatCard
          label="Giáo lý viên"
          value={summary?.catechists.length ?? "—"}
          sub="Đang phụ trách"
          icon={<AwardIcon size={18} />}
          color="green"
        />
        <StatCard
          label="Điểm danh TB"
          value={summary ? `${summary.attendance}%` : "—"}
          sub="Từ dữ liệu điểm danh"
          icon={<CheckCircleIcon size={18} />}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Attendance by class */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5">
            <SectionHeader
              title="Tỉ lệ điểm danh theo lớp"
              subtitle="Dữ liệu hiện tại"
              action={
                <Button variant="ghost" size="sm" onClick={() => onNavigate("reports")}>
                  Xem báo cáo
                </Button>
              }
            />
            <div className="mt-5 space-y-4">
              {(summary?.classes ?? []).map((cls) => (
                <div key={cls.id} className="flex items-center gap-4">
                  <p className="text-sm text-warm-700 w-36 flex-shrink-0">{cls.name}</p>
                  <div className="flex-1">
                    <ProgressBar
                      value={cls.attendance}
                      color={cls.attendance >= 90 ? "green" : cls.attendance >= 80 ? "navy" : "red"}
                      showPercent
                    />
                  </div>
                  <span className="text-xs text-warm-400 w-10 text-right">{cls.enrolled} hs</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent sessions */}
          <Card className="p-5">
            <SectionHeader
              title="Buổi học gần đây"
              action={
                <Button variant="ghost" size="sm" onClick={() => onNavigate("sessions")}>
                  Tất cả
                </Button>
              }
            />
            <div className="mt-4 space-y-3">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-center gap-4 py-2 border-b border-warm-100 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-warm-800 truncate">{s.class.name}</p>
                    <p className="text-xs text-warm-400 truncate">{s.assignment?.catechist.fullName || "Chưa phân công"} · {new Date(s.sessionDate).toLocaleDateString("vi-VN")}</p>
                  </div>
                  {s.status === "COMPLETED" ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-warm-600">{s._count.attendances} điểm danh</span>
                      <Badge variant="success">Xong</Badge>
                    </div>
                  ) : (
                    <Badge variant="muted">Sắp tới</Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Alerts */}
          <Card className="p-5">
            <SectionHeader title="Thông báo" subtitle="Cần chú ý" />
            <div className="mt-4 space-y-2.5">
              {(summary?.classes.filter((item) => item.catechists.length === 0) ?? []).map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg text-sm bg-amber-50 text-amber-800 border border-amber-200"
                >
                  <AlertTriangleIcon size={14} />
                  <span className="flex-1">{item.name} chưa có giáo lý viên</span>
                </div>
              ))}
              {!loading && !summary?.classes.some((item) => item.catechists.length === 0) && (
                <p className="text-sm text-warm-400">Không có cảnh báo mới.</p>
              )}
            </div>
          </Card>

          {/* Quick actions */}
          <Card className="p-5">
            <SectionHeader title="Thao tác nhanh" />
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                { label: "Thêm học sinh", screen: "students", color: "bg-navy-50 text-navy-800 hover:bg-navy-100" },
                { label: "Thêm lớp học", screen: "classes", color: "bg-gold-50 text-gold-700 hover:bg-gold-100" },
                { label: "Tạo buổi học", screen: "sessions", color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
                { label: "Xem báo cáo", screen: "reports", color: "bg-warm-100 text-warm-700 hover:bg-warm-200" },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() => onNavigate(action.screen as AdminScreen)}
                  className={`${action.color} rounded-lg p-3 text-xs font-medium text-left cursor-pointer leading-tight`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Grade overview */}
          <Card className="p-5">
            <SectionHeader
              title="Đánh giá học kỳ 1"
              action={<Button variant="ghost" size="sm" onClick={() => onNavigate("assessments")}>Chi tiết</Button>}
            />
            <div className="mt-4 space-y-3">
              {classDistribution.map((g) => (
                <div key={g.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-warm-600">{g.label}</span>
                    <span className="text-warm-500 font-medium">{g.count} lớp</span>
                  </div>
                  <ProgressBar value={activeClasses ? (g.count / activeClasses) * 100 : 0} color={g.color} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
