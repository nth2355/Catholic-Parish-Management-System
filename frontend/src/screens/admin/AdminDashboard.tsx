import { StatCard, Card, Badge, Button, ProgressBar, SectionHeader, UsersIcon, BookOpenIcon, CalendarIcon, AwardIcon, CheckCircleIcon, AlertTriangleIcon, TrendingUpIcon } from "../../components/ui";

type AdminScreen = "dashboard" | "students" | "classes" | "catechists" | "sessions" | "assessments" | "reports";

const recentSessions = [
  { class: "Lớp Xưng Tội 1", catechist: "Chị Maria Nguyễn", date: "Chủ nhật, 03/09", attendance: 24, total: 26, status: "done" },
  { class: "Lớp Thêm Sức A", catechist: "Anh Giuse Trần", date: "Chủ nhật, 03/09", attendance: 18, total: 20, status: "done" },
  { class: "Lớp Rước Lễ 2", catechist: "Chị Anna Lê", date: "Chủ nhật, 10/09", attendance: 0, total: 22, status: "upcoming" },
  { class: "Lớp Tìm Hiểu B", catechist: "Anh Phêrô Võ", date: "Thứ 7, 09/09", attendance: 0, total: 19, status: "upcoming" },
];

const alerts = [
  { text: "Lớp Xưng Tội 2 chưa có giáo lý viên", type: "warning" },
  { text: "3 học sinh vắng mặt 3 buổi liên tiếp", type: "danger" },
  { text: "Bài đánh giá học kỳ 1 sắp đến hạn (20/09)", type: "info" },
];

export default function AdminDashboard({ onNavigate }: { onNavigate: (s: AdminScreen) => void }) {
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-warm-400 uppercase tracking-wider mb-1">Mùa vụ 2024–2025</p>
          <h1 className="text-xl font-bold text-warm-900" style={{ fontFamily: "var(--font-display)" }}>
            Chào buổi sáng, Anh Trưởng ✦
          </h1>
          <p className="text-sm text-warm-500 mt-0.5">Hôm nay, Chủ nhật 08/09/2024</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => onNavigate("sessions")}>
          <CalendarIcon size={13} /> Buổi hôm nay
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Tổng học sinh"
          value="247"
          sub="Năm học hiện tại"
          icon={<UsersIcon size={18} />}
          trend={{ value: "+12 so với năm trước", up: true }}
          color="navy"
        />
        <StatCard
          label="Số lớp học"
          value="12"
          sub="4 khối, 12 lớp"
          icon={<BookOpenIcon size={18} />}
          color="gold"
        />
        <StatCard
          label="Giáo lý viên"
          value="23"
          sub="18 nữ · 5 nam"
          icon={<AwardIcon size={18} />}
          color="green"
        />
        <StatCard
          label="Điểm danh TB"
          value="91.4%"
          sub="Tháng 9/2024"
          icon={<CheckCircleIcon size={18} />}
          trend={{ value: "+2.1% so với tháng trước", up: true }}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Attendance by class */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5">
            <SectionHeader
              title="Tỉ lệ điểm danh theo lớp"
              subtitle="Tháng 9/2024"
              action={
                <Button variant="ghost" size="sm" onClick={() => onNavigate("reports")}>
                  Xem báo cáo
                </Button>
              }
            />
            <div className="mt-5 space-y-4">
              {[
                { name: "Lớp Xưng Tội 1", pct: 96, total: 26 },
                { name: "Lớp Xưng Tội 2", pct: 88, total: 24 },
                { name: "Lớp Thêm Sức A", pct: 94, total: 20 },
                { name: "Lớp Thêm Sức B", pct: 79, total: 22 },
                { name: "Lớp Rước Lễ 1", pct: 95, total: 25 },
                { name: "Lớp Rước Lễ 2", pct: 91, total: 22 },
              ].map((cls, i) => (
                <div key={i} className="flex items-center gap-4">
                  <p className="text-sm text-warm-700 w-36 flex-shrink-0">{cls.name}</p>
                  <div className="flex-1">
                    <ProgressBar
                      value={cls.pct}
                      color={cls.pct >= 90 ? "green" : cls.pct >= 80 ? "navy" : "red"}
                      showPercent
                    />
                  </div>
                  <span className="text-xs text-warm-400 w-10 text-right">{cls.total} hs</span>
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
              {recentSessions.map((s, i) => (
                <div key={i} className="flex items-center gap-4 py-2 border-b border-warm-100 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-warm-800 truncate">{s.class}</p>
                    <p className="text-xs text-warm-400 truncate">{s.catechist} · {s.date}</p>
                  </div>
                  {s.status === "done" ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-warm-600">{s.attendance}/{s.total}</span>
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
              {alerts.map((a, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-lg text-sm ${
                    a.type === "warning" ? "bg-amber-50 text-amber-800 border border-amber-200" :
                    a.type === "danger" ? "bg-red-50 text-red-800 border border-red-200" :
                    "bg-navy-50 text-navy-800 border border-navy-100"
                  }`}
                >
                  <AlertTriangleIcon size={14} />
                  <span className="flex-1">{a.text}</span>
                </div>
              ))}
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
              {[
                { label: "Xuất sắc (9–10)", count: 48, pct: 80, color: "green" as const },
                { label: "Tốt (7–8.9)", count: 112, pct: 65, color: "navy" as const },
                { label: "Khá (5–6.9)", count: 67, pct: 40, color: "gold" as const },
                { label: "Cần cải thiện", count: 20, pct: 15, color: "red" as const },
              ].map((g, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-warm-600">{g.label}</span>
                    <span className="text-warm-500 font-medium">{g.count} hs</span>
                  </div>
                  <ProgressBar value={g.pct} color={g.color} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
