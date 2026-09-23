import { useEffect, useState } from "react";
import {
  Card, Button, Badge, SectionHeader, Tabs,
  StatCard, ProgressBar, Toast, BarChartIcon, DownloadIcon,
  TrendingUpIcon, UsersIcon, CalendarIcon, AwardIcon,
} from "../../components/ui";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
type ReportClass = { id: string; name: string; attendance: number; avg: number; enrolled: number; sessions: number };
type ReportCatechist = { id: string; fullName: string; baptismalName: string | null; className: string; sessions: number; attendance: number; avgGrade: number };
type MonthlyAttendance = { month: string; attendance: number };
type ReportSummary = { students: number; attendance: number; avgGrade: number; classes: ReportClass[]; catechists: ReportCatechist[]; monthlyAttendance: MonthlyAttendance[] };

function MiniBarChart({ data }: { data: MonthlyAttendance[] }) {
  if (!data.length) {
    return <p className="text-sm text-warm-400">Chưa có dữ liệu điểm danh.</p>;
  }
  const max = Math.max(...data.map(d => d.attendance), 1);
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
          <span className="text-xs text-warm-400">
            {new Intl.DateTimeFormat("vi-VN", { month: "short", year: "numeric" }).format(new Date(`${d.month}-01`))}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Reports() {
  const [tab, setTab] = useState("attendance");
  const [toast, setToast] = useState<string | null>(null);
  const [summary, setSummary] = useState<ReportSummary | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };
  const exportReport = () => {
    if (!summary) {
      showToast("Báo cáo chưa có dữ liệu để xuất");
      return;
    }
    const rows = [
      ["Lớp", "Số học sinh", "Điểm danh", "Điểm trung bình", "Số buổi"],
      ...summary.classes.map((classRecord) => [
        classRecord.name,
        String(classRecord.enrolled),
        `${classRecord.attendance}%`,
        String(classRecord.avg || ""),
        String(classRecord.sessions),
      ]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "bao-cao-thong-ke.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };
  useEffect(() => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    fetch(`${API_BASE_URL}/reports/summary`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Không thể tải báo cáo");
        setSummary(result.data);
      })
      .catch((error) => showToast(error instanceof Error ? error.message : "Không thể tải báo cáo"));
  }, []);

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      <SectionHeader
        title="Báo cáo & thống kê"
        subtitle="Dữ liệu hiện tại"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={exportReport} disabled={!summary}>
              <DownloadIcon size={14} /> Xuất CSV
            </Button>
          </div>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Tổng học sinh" value={summary?.students ?? "—"} color="navy" icon={<UsersIcon size={18} />} />
        <StatCard label="Điểm danh TB" value={summary ? `${summary.attendance}%` : "—"} color="green" icon={<CalendarIcon size={18} />} />
        <StatCard label="Điểm TB học kỳ" value={summary?.avgGrade || "—"} color="gold" icon={<AwardIcon size={18} />} />
        <StatCard label="Lớp chuyên cần ≥95%" value={summary ? `${summary.classes.filter((classRecord) => classRecord.attendance >= 95).length}/${summary.classes.length}` : "—"} color="navy" icon={<TrendingUpIcon size={18} />} />
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
              <MiniBarChart data={summary?.monthlyAttendance ?? []} />
            </div>

            {/* By class */}
            <div>
              <h3 className="text-sm font-semibold text-warm-800 mb-4" style={{ fontFamily: "var(--font-display)" }}>
                Điểm danh theo lớp
              </h3>
              <div className="space-y-3">
                {(summary?.classes ?? []).map((c) => (
                  <div key={c.id} className="flex items-center gap-4">
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
                <p className="text-2xl font-bold text-navy-900" style={{ fontFamily: "var(--font-display)" }}>{summary ? `${summary.attendance}%` : "—"}</p>
                <p className="text-xs text-warm-500 mt-1">Điểm danh trung bình</p>
              </div>
              <div className="text-center border-x border-warm-200">
                <p className="text-2xl font-bold text-emerald-600" style={{ fontFamily: "var(--font-display)" }}>{summary?.classes.filter((classRecord) => classRecord.attendance >= 95).length ?? "—"}</p>
                <p className="text-xs text-warm-500 mt-1">Lớp có điểm danh ≥95%</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-500" style={{ fontFamily: "var(--font-display)" }}>{summary?.classes.filter((classRecord) => classRecord.attendance > 0 && classRecord.attendance < 80).length ?? "—"}</p>
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
                    { label: "Xuất sắc (9–10)", color: "green" as const, count: summary?.classes.filter((c) => c.avg >= 9).length ?? 0 },
                    { label: "Tốt (7–8.9)", color: "navy" as const, count: summary?.classes.filter((c) => c.avg >= 7 && c.avg < 9).length ?? 0 },
                    { label: "Khá (5–6.9)", color: "gold" as const, count: summary?.classes.filter((c) => c.avg >= 5 && c.avg < 7).length ?? 0 },
                    { label: "Cần cố gắng (<5)", color: "red" as const, count: summary?.classes.filter((c) => c.avg > 0 && c.avg < 5).length ?? 0 },
                  ].map((r, i) => {
                    const total = summary?.classes.length || 0;
                    const pct = total ? Math.round((r.count / total) * 100) : 0;
                    return (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-warm-600">{r.label}</span>
                        <span className="font-medium text-warm-800">{r.count} lớp ({pct}%)</span>
                      </div>
                      <ProgressBar value={r.pct} color={r.color} />
                    </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-warm-800 mb-4" style={{ fontFamily: "var(--font-display)" }}>
                  Điểm TB theo lớp
                </h3>
                <div className="space-y-3">
                  {(summary?.classes ?? []).map((c) => (
                    <div key={c.id} className="flex items-center gap-3">
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
              {(summary?.catechists ?? []).map((c, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-warm-100 hover:border-warm-200">
                  <span className="w-5 text-xs text-warm-400 font-medium">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-warm-900">{c.fullName}</p>
                    <p className="text-xs text-warm-400">Lớp {c.className} · {c.sessions} buổi</p>
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
