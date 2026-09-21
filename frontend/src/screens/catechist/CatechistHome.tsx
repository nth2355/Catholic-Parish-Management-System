import { Card, Badge, Button, ProgressBar, StatCard, CalendarIcon, UsersIcon, CheckCircleIcon, AwardIcon } from "../../components/ui";

export default function CatechistHome({ onAttend }: { onAttend: () => void }) {
  const today = new Date();
  const timeGreeting = today.getHours() < 12 ? "buổi sáng" : today.getHours() < 18 ? "buổi chiều" : "buổi tối";

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="bg-navy-950 px-5 pt-12 pb-6">
        <div className="flex items-center justify-between mb-1">
          <div className="w-6 h-6 opacity-30">
            <svg viewBox="0 0 24 24" fill="none">
              <line x1="12" y1="3" x2="12" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <line x1="5" y1="9" x2="19" y2="9" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <line x1="8" y1="21" x2="16" y2="21" stroke="#C9973A" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">MN</span>
          </div>
        </div>
        <p className="text-white/60 text-sm mt-3">Chào {timeGreeting},</p>
        <h1 className="text-white text-xl font-bold mt-0.5" style={{ fontFamily: "var(--font-display)" }}>
          Chị Maria Nguyễn ✦
        </h1>
        <p className="text-white/50 text-xs mt-1">Giáo lý viên · Lớp Xưng Tội 1</p>

        {/* Today's session card */}
        <div className="mt-4 bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/60 text-xs">Buổi học hôm nay</p>
              <p className="text-white font-semibold mt-1" style={{ fontFamily: "var(--font-display)" }}>
                Bí Tích Xưng Tội – Bài 3
              </p>
              <p className="text-white/60 text-xs mt-0.5">Chủ nhật 08/09 · 08:00–09:30 · Phòng A1</p>
            </div>
            <Badge variant="gold">Sắp bắt đầu</Badge>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={onAttend}
              className="flex-1 bg-gold-500 text-white text-sm font-semibold py-2.5 rounded-xl cursor-pointer hover:bg-gold-600 text-center"
            >
              Điểm danh ngay
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 -mt-2">
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white rounded-2xl p-4 border border-warm-200 shadow-sm">
            <p className="text-xs text-warm-500">Lớp Xưng Tội 1</p>
            <p className="text-2xl font-bold text-navy-900 mt-1" style={{ fontFamily: "var(--font-display)" }}>26</p>
            <p className="text-xs text-warm-400">Học sinh</p>
            <ProgressBar value={26} max={30} color="navy" className="mt-2" />
          </div>
          <div className="bg-white rounded-2xl p-4 border border-warm-200 shadow-sm">
            <p className="text-xs text-warm-500">Điểm danh TB</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1" style={{ fontFamily: "var(--font-display)" }}>96%</p>
            <p className="text-xs text-warm-400">Tháng này</p>
            <ProgressBar value={96} color="green" className="mt-2" />
          </div>
        </div>
      </div>

      {/* Upcoming sessions */}
      <div className="px-4 mt-5">
        <h2 className="text-sm font-bold text-warm-900 mb-3" style={{ fontFamily: "var(--font-display)" }}>
          Lịch học sắp tới
        </h2>
        <div className="space-y-2.5">
          {[
            { date: "CN 08/09", time: "08:00", topic: "Bí Tích Xưng Tội – Bài 3", done: false, today: true },
            { date: "CN 15/09", time: "08:00", topic: "Bí Tích Xưng Tội – Bài 4", done: false, today: false },
            { date: "CN 22/09", time: "08:00", topic: "Bí Tích Xưng Tội – Bài 5", done: false, today: false },
          ].map((s, i) => (
            <div
              key={i}
              className={`bg-white rounded-2xl p-4 border flex items-center gap-4 ${s.today ? "border-navy-200 bg-navy-50/30" : "border-warm-200"}`}
            >
              <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${s.today ? "bg-navy-900 text-white" : "bg-warm-100 text-warm-600"}`}>
                <span className="text-xs font-medium">{s.date.split(" ")[0]}</span>
                <span className="text-lg font-bold leading-tight">{s.date.split(" ")[1].split("/")[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-warm-900 truncate">{s.topic}</p>
                <p className="text-xs text-warm-400 mt-0.5">{s.time} · Phòng A1</p>
              </div>
              {s.today && (
                <button
                  onClick={onAttend}
                  className="bg-navy-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer flex-shrink-0"
                >
                  Điểm danh
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent attendance */}
      <div className="px-4 mt-5">
        <h2 className="text-sm font-bold text-warm-900 mb-3" style={{ fontFamily: "var(--font-display)" }}>
          Điểm danh gần đây
        </h2>
        <div className="bg-white rounded-2xl border border-warm-200 divide-y divide-warm-100">
          {[
            { date: "CN 01/09", present: 24, absent: 1, late: 1, total: 26 },
            { date: "CN 25/08", present: 26, absent: 0, late: 0, total: 26 },
            { date: "CN 18/08", present: 23, absent: 2, late: 1, total: 26 },
          ].map((r, i) => (
            <div key={i} className="flex items-center px-4 py-3 gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-warm-800">{r.date}</p>
                <div className="flex gap-3 mt-0.5">
                  <span className="text-xs text-emerald-600">✓ {r.present}</span>
                  {r.absent > 0 && <span className="text-xs text-red-500">✕ {r.absent}</span>}
                  {r.late > 0 && <span className="text-xs text-amber-500">⏱ {r.late}</span>}
                </div>
              </div>
              <div className="text-xs text-warm-400">{r.present}/{r.total}</div>
              <Badge variant={r.present === r.total ? "success" : "warning"}>
                {r.present === r.total ? "Đầy đủ" : "Vắng " + r.absent}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
