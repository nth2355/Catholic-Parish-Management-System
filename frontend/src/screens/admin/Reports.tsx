import { useState } from "react";
import {
  Card, Button, Badge, Select, SectionHeader, Tabs,
  StatCard, ProgressBar, Toast, BarChartIcon, DownloadIcon,
  TrendingUpIcon, UsersIcon, CalendarIcon, AwardIcon,
} from "../../components/ui";

const monthlyData = [
  { month: "T8", attendance: 87, enrolled: 243 },
  { month: "T9", attendance: 91, enrolled: 247 },
  { month: "T10", attendance: 93, enrolled: 250 },
  { month: "T11", attendance: 89, enrolled: 248 },
  { month: "T12", attendance: 85, enrolled: 245 },
];

const classData = [
  { name: "Xưng Tội 1", attendance: 96, avg: 9.35, enrolled: 26 },
  { name: "Xưng Tội 2", attendance: 88, avg: 7.2, enrolled: 24 },
  { name: "Thêm Sức A", attendance: 94, avg: 7.3, enrolled: 20 },
  { name: "Thêm Sức B", attendance: 79, avg: 5.5, enrolled: 22 },
  { name: "Rước Lễ 1", attendance: 95, avg: 8.9, enrolled: 25 },
  { name: "Rước Lễ 2", attendance: 91, avg: 8.5, enrolled: 22 },
  { name: "Tìm Hiểu A", attendance: 85, avg: 7.8, enrolled: 18 },
  { name: "Tìm Hiểu B", attendance: 89, avg: 8.1, enrolled: 19 },
];

function MiniBarChart({ data }: { data: typeof monthlyData }) {
  const max = Math.max(...data.map(d => d.attendance));
  return (
    <div className="flex items-end gap-2 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-xs text-warm-500">{d.attendance}%</span>
          <div className="w-full bg-warm-100 rounded-t-sm overflow-hidden" style={{ height: 64 }}>
            <div
              className="w-full bg-navy-900 rounded-t-sm transition-all duration-500"
              style={{ height: `${(d.attendance / max) * 64}px`, marginTop: `${64 - (d.attendance / max) * 64}px` }}
            />
          </div>
          <span className="text-xs text-warm-400">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

export default function Reports() {
  const [tab, setTab] = useState("attendance");
  const [period, setPeriod] = useState("semester1");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      <SectionHeader
        title="Báo cáo & thống kê"
        subtitle="Năm học 2024–2025"
        action={
          <div className="flex gap-2">
            <Select
              value={period}
              onChange={setPeriod}
              options={[
                { value: "semester1", label: "Học kỳ 1" },
                { value: "semester2", label: "Học kỳ 2" },
                { value: "full", label: "Cả năm" },
              ]}
              className="w-36"
            />
            <Button variant="secondary" onClick={() => showToast("Đang xuất báo cáo PDF...")}>
              <DownloadIcon size={14} /> Xuất PDF
            </Button>
          </div>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Tổng học sinh" value="247" trend={{ value: "+12 so với năm trước", up: true }} color="navy" icon={<UsersIcon size={18} />} />
        <StatCard label="Điểm danh TB" value="91.4%" trend={{ value: "+2.1%", up: true }} color="green" icon={<CalendarIcon size={18} />} />
        <StatCard label="Điểm TB học kỳ" value="7.9" color="gold" icon={<AwardIcon size={18} />} />
        <StatCard label="GLV chuyên cần ≥95%" value="16/23" color="navy" icon={<TrendingUpIcon size={18} />} />
      </div>

      <Card>
        <div className="p-4 border-b border-warm-100 flex items-center justify-between flex-wrap gap-3">
          <Tabs
            tabs={[
              { id: "attendance", label: "Điểm danh" },
              { id: "grades", label: "Học lực" },
              { id: "catechists", label: "Giáo lý viên" },
            ]}
            active={tab}
            onChange={setTab}
          />
        </div>

        {tab === "attendance" && (
          <div className="p-5 space-y-6">
            {/* Trend chart */}
            <div>
              <h3 className="text-sm font-semibold text-warm-800 mb-4" style={{ fontFamily: "var(--font-display)" }}>
                Xu hướng điểm danh (tháng)
              </h3>
              <MiniBarChart data={monthlyData} />
            </div>

            {/* By class */}
            <div>
              <h3 className="text-sm font-semibold text-warm-800 mb-4" style={{ fontFamily: "var(--font-display)" }}>
                Điểm danh theo lớp
              </h3>
              <div className="space-y-3">
                {classData.map((c, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-sm text-warm-700 w-32 flex-shrink-0">{c.name}</span>
                    <div className="flex-1">
                      <ProgressBar
                        value={c.attendance}
                        color={c.attendance >= 90 ? "green" : c.attendance >= 80 ? "navy" : "red"}
                        showPercent
                      />
                    </div>
                    <span className="text-xs text-warm-400 w-16 text-right">{c.enrolled} học sinh</span>
                    <Badge variant={c.attendance >= 90 ? "success" : c.attendance >= 80 ? "navy" : "danger"}>
                      {c.attendance >= 90 ? "Tốt" : c.attendance >= 80 ? "Khá" : "Cần cải thiện"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary table */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-warm-50 rounded-xl border border-warm-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-navy-900" style={{ fontFamily: "var(--font-display)" }}>91.4%</p>
                <p className="text-xs text-warm-500 mt-1">Điểm danh trung bình</p>
              </div>
              <div className="text-center border-x border-warm-200">
                <p className="text-2xl font-bold text-emerald-600" style={{ fontFamily: "var(--font-display)" }}>3</p>
                <p className="text-xs text-warm-500 mt-1">Lớp có điểm danh ≥95%</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-500" style={{ fontFamily: "var(--font-display)" }}>1</p>
                <p className="text-xs text-warm-500 mt-1">Lớp cần cải thiện</p>
              </div>
            </div>
          </div>
        )}

        {tab === "grades" && (
          <div className="p-5 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-warm-800 mb-4" style={{ fontFamily: "var(--font-display)" }}>
                  Phân bố học lực
                </h3>
                <div className="space-y-4">
                  {[
                    { label: "Xuất sắc (9–10)", pct: 19, count: 48, color: "green" as const },
                    { label: "Tốt (7–8.9)", pct: 45, count: 112, color: "navy" as const },
                    { label: "Khá (5–6.9)", pct: 27, count: 67, color: "gold" as const },
                    { label: "Cần cố gắng (<5)", pct: 8, count: 20, color: "red" as const },
                  ].map((r, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-warm-600">{r.label}</span>
                        <span className="font-medium text-warm-800">{r.count} hs ({r.pct}%)</span>
                      </div>
                      <ProgressBar value={r.pct} color={r.color} />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-warm-800 mb-4" style={{ fontFamily: "var(--font-display)" }}>
                  Điểm TB theo lớp
                </h3>
                <div className="space-y-3">
                  {classData.map((c, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-warm-600 w-28">{c.name}</span>
                      <div className="flex-1">
                        <ProgressBar value={c.avg * 10} color={c.avg >= 8 ? "green" : c.avg >= 6 ? "navy" : "red"} />
                      </div>
                      <span className="text-sm font-bold text-warm-800 w-8">{c.avg}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "catechists" && (
          <div className="p-5">
            <div className="space-y-3">
              {[
                { name: "Chị Anna Lê Thị Phương", class: "Rước Lễ 1", sessions: 12, attendance: 100, avgGrade: 8.9 },
                { name: "Chị Maria Nguyễn Thị Hoa", class: "Xưng Tội 1", sessions: 12, attendance: 98, avgGrade: 9.35 },
                { name: "Anh Phêrô Võ Quốc Bảo", class: "Rước Lễ 2", sessions: 11, attendance: 96, avgGrade: 8.5 },
                { name: "Anh Giuse Trần Văn Minh", class: "Thêm Sức A", sessions: 12, attendance: 95, avgGrade: 7.3 },
                { name: "Anh Tôma Đặng Thanh Tú", class: "Tìm Hiểu A", sessions: 11, attendance: 94, avgGrade: 7.8 },
                { name: "Chị Cecilia Bùi Thị Ngọc", class: "Tìm Hiểu B", sessions: 10, attendance: 88, avgGrade: 8.1 },
                { name: "Chị Têrêxa Phạm Thị Lan", class: "Thêm Sức B", sessions: 12, attendance: 92, avgGrade: 5.5 },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-warm-100 hover:border-warm-200">
                  <span className="w-5 text-xs text-warm-400 font-medium">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-warm-900">{c.name}</p>
                    <p className="text-xs text-warm-400">Lớp {c.class} · {c.sessions} buổi</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm font-bold text-warm-800">{c.attendance}%</p>
                      <p className="text-xs text-warm-400">Chuyên cần</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-warm-800">{c.avgGrade}</p>
                      <p className="text-xs text-warm-400">Điểm TB lớp</p>
                    </div>
                    <Badge variant={c.attendance >= 95 ? "success" : c.attendance >= 85 ? "navy" : "warning"}>
                      {c.attendance >= 95 ? "Xuất sắc" : c.attendance >= 85 ? "Tốt" : "Khá"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {toast && <Toast message={toast} type="success" onClose={() => setToast(null)} />}
    </div>
  );
}
