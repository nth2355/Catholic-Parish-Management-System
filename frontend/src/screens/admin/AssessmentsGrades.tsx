import { useState } from "react";
import {
  Card, Button, Badge, Table, Select, SectionHeader,
  Tabs, Avatar, StatCard, ProgressBar, Toast, AwardIcon, TrendingUpIcon,
  UsersIcon, PlusIcon,
} from "../../components/ui";

const GRADES = [
  { id: 1, name: "Nguyễn Thị Bảo Châu", baptism: "Maria", class: "Lớp Xưng Tội 1", midterm: 9.2, final: null, attendance: 96, conduct: "Tốt" },
  { id: 2, name: "Trần Minh Khôi", baptism: "Giuse", class: "Lớp Thêm Sức A", midterm: 7.8, final: null, attendance: 88, conduct: "Khá" },
  { id: 3, name: "Lê Thị Hương Giang", baptism: "Anna", class: "Lớp Xưng Tội 1", midterm: 9.5, final: null, attendance: 100, conduct: "Tốt" },
  { id: 4, name: "Phạm Quốc Hùng", baptism: "Phêrô", class: "Lớp Thêm Sức B", midterm: 5.5, final: null, attendance: 62, conduct: "TB" },
  { id: 5, name: "Võ Thị Mỹ Linh", baptism: "Têrêxa", class: "Lớp Rước Lễ 1", midterm: 8.9, final: null, attendance: 92, conduct: "Tốt" },
  { id: 6, name: "Đặng Văn Tùng", baptism: "Augustinô", class: "Lớp Xưng Tội 2", midterm: 7.2, final: null, attendance: 85, conduct: "Khá" },
  { id: 7, name: "Ngô Thị Lan Anh", baptism: "Cecilia", class: "Lớp Rước Lễ 2", midterm: 8.5, final: null, attendance: 94, conduct: "Tốt" },
  { id: 8, name: "Bùi Thanh Long", baptism: "Micae", class: "Lớp Thêm Sức A", midterm: 6.8, final: null, attendance: 78, conduct: "Khá" },
];

function gradeLabel(score: number) {
  if (score >= 9) return { label: "Xuất sắc", variant: "success" as const };
  if (score >= 7) return { label: "Tốt", variant: "navy" as const };
  if (score >= 5) return { label: "Khá", variant: "gold" as const };
  return { label: "Cần cố gắng", variant: "danger" as const };
}

export default function AssessmentsGrades() {
  const [tab, setTab] = useState("grades");
  const [classFilter, setClassFilter] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const filtered = GRADES.filter(g => !classFilter || g.class === classFilter);
  const avg = (filtered.reduce((s, g) => s + g.midterm, 0) / filtered.length).toFixed(1);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      <SectionHeader
        title="Đánh giá & điểm số"
        subtitle="Năm học 2024–2025"
        action={
          <Button variant="primary" onClick={() => showToast("Tạo bài đánh giá mới...")}>
            <PlusIcon size={14} /> Tạo bài đánh giá
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Điểm TB giữa kỳ" value={avg} sub="Học kỳ 1" color="navy" icon={<AwardIcon size={18} />} />
        <StatCard label="Xuất sắc (≥9)" value={GRADES.filter(g => g.midterm >= 9).length} sub="học sinh" color="green" icon={<TrendingUpIcon size={18} />} />
        <StatCard label="Cần hỗ trợ (<5)" value={GRADES.filter(g => g.midterm < 5).length} sub="học sinh" color="red" icon={<UsersIcon size={18} />} />
        <StatCard label="Chưa có điểm cuối kỳ" value={GRADES.filter(g => g.final === null).length} color="gold" icon={<AwardIcon size={18} />} />
      </div>

      <Card>
        <div className="p-4 border-b border-warm-100 flex items-center justify-between flex-wrap gap-3">
          <Tabs
            tabs={[
              { id: "grades", label: "Điểm số" },
              { id: "assessments", label: "Bài đánh giá" },
              { id: "overview", label: "Tổng quan" },
            ]}
            active={tab}
            onChange={setTab}
          />
          <div className="flex gap-2 items-center">
            <Select
              value={classFilter}
              onChange={setClassFilter}
              placeholder="Tất cả lớp"
              options={[
                { value: "Lớp Xưng Tội 1", label: "Lớp Xưng Tội 1" },
                { value: "Lớp Xưng Tội 2", label: "Lớp Xưng Tội 2" },
                { value: "Lớp Thêm Sức A", label: "Lớp Thêm Sức A" },
                { value: "Lớp Thêm Sức B", label: "Lớp Thêm Sức B" },
                { value: "Lớp Rước Lễ 1", label: "Lớp Rước Lễ 1" },
                { value: "Lớp Rước Lễ 2", label: "Lớp Rước Lễ 2" },
              ]}
              className="w-44"
            />
            <Button variant="secondary" size="sm" onClick={() => showToast("Xuất Excel...")}>
              Xuất Excel
            </Button>
          </div>
        </div>

        {tab === "grades" && (
          <Table
            headers={["Học sinh", "Lớp", "Điểm giữa kỳ", "Điểm cuối kỳ", "Điểm danh", "Hạnh kiểm", "Xếp loại"]}
            rows={filtered.map(g => [
              <div className="flex items-center gap-2">
                <Avatar name={g.name} size="sm" />
                <div>
                  <p className="text-sm font-medium text-warm-900">{g.name}</p>
                  <p className="text-xs text-warm-400">{g.baptism}</p>
                </div>
              </div>,
              <span className="text-warm-600 text-sm">{g.class}</span>,
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${g.midterm >= 9 ? "text-emerald-600" : g.midterm >= 7 ? "text-navy-800" : g.midterm >= 5 ? "text-gold-600" : "text-red-600"}`}>
                  {g.midterm.toFixed(1)}
                </span>
                <span className="text-warm-300 text-xs">/10</span>
              </div>,
              g.final !== null
                ? <span className="text-lg font-bold text-warm-800">{g.final}</span>
                : <span className="text-xs text-warm-300 italic">Chưa có</span>,
              <div className="flex items-center gap-1">
                <div className="w-16 h-1.5 bg-warm-100 rounded-full">
                  <div
                    className={`h-full rounded-full ${g.attendance >= 90 ? "bg-emerald-500" : g.attendance >= 75 ? "bg-navy-700" : "bg-red-400"}`}
                    style={{ width: `${g.attendance}%` }}
                  />
                </div>
                <span className="text-xs text-warm-500">{g.attendance}%</span>
              </div>,
              <Badge variant={g.conduct === "Tốt" ? "success" : g.conduct === "Khá" ? "navy" : "warning"}>
                {g.conduct}
              </Badge>,
              <Badge variant={gradeLabel(g.midterm).variant}>{gradeLabel(g.midterm).label}</Badge>,
            ])}
          />
        )}

        {tab === "assessments" && (
          <div className="p-4 space-y-3">
            {[
              { name: "Bài kiểm tra giữa kỳ 1", date: "15/10/2024", classes: "Tất cả lớp", status: "Chưa bắt đầu", type: "Viết" },
              { name: "Bài thi vấn đáp – Xưng Tội", date: "30/09/2024", classes: "Lớp Xưng Tội 1, 2", status: "Đang chuẩn bị", type: "Vấn đáp" },
              { name: "Bài kiểm tra đầu năm", date: "25/08/2024", classes: "Tất cả lớp", status: "Hoàn thành", type: "Viết" },
            ].map((a, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-warm-200 hover:border-navy-200 hover:bg-navy-50/30">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-navy-50 rounded-lg flex items-center justify-center">
                    <AwardIcon size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-warm-900 text-sm" style={{ fontFamily: "var(--font-display)" }}>{a.name}</p>
                    <p className="text-xs text-warm-400">{a.classes} · {a.type} · {a.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={a.status === "Hoàn thành" ? "success" : a.status === "Đang chuẩn bị" ? "navy" : "muted"}>
                    {a.status}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => showToast("Xem bài đánh giá...")}>Chi tiết</Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "overview" && (
          <div className="p-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <h3 className="text-sm font-semibold text-warm-700 mb-4" style={{ fontFamily: "var(--font-display)" }}>
                  Phân bố điểm số
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Xuất sắc (9–10)", count: GRADES.filter(g => g.midterm >= 9).length, total: GRADES.length, color: "green" as const },
                    { label: "Tốt (7–8.9)", count: GRADES.filter(g => g.midterm >= 7 && g.midterm < 9).length, total: GRADES.length, color: "navy" as const },
                    { label: "Khá (5–6.9)", count: GRADES.filter(g => g.midterm >= 5 && g.midterm < 7).length, total: GRADES.length, color: "gold" as const },
                    { label: "Cần cố gắng (<5)", count: GRADES.filter(g => g.midterm < 5).length, total: GRADES.length, color: "red" as const },
                  ].map((r, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-warm-600">{r.label}</span>
                        <span className="text-warm-700 font-medium">{r.count} học sinh</span>
                      </div>
                      <ProgressBar value={r.count} max={r.total} color={r.color} showPercent />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-warm-700 mb-4" style={{ fontFamily: "var(--font-display)" }}>
                  Điểm TB theo lớp
                </h3>
                <div className="space-y-3">
                  {[
                    { class: "Lớp Xưng Tội 1", avg: 9.35 },
                    { class: "Lớp Xưng Tội 2", avg: 7.2 },
                    { class: "Lớp Thêm Sức A", avg: 7.3 },
                    { class: "Lớp Thêm Sức B", avg: 5.5 },
                    { class: "Lớp Rước Lễ 1", avg: 8.9 },
                    { class: "Lớp Rước Lễ 2", avg: 8.5 },
                  ].map((c, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-warm-600 w-36">{c.class}</span>
                      <div className="flex-1">
                        <ProgressBar value={c.avg} max={10} color={c.avg >= 8 ? "green" : c.avg >= 6 ? "navy" : "red"} />
                      </div>
                      <span className="text-sm font-bold text-warm-800 w-8">{c.avg}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {toast && <Toast message={toast} type="success" onClose={() => setToast(null)} />}
    </div>
  );
}
