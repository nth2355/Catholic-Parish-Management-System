import { useState } from "react";
import { Card, Badge, Avatar, ProgressBar, SearchInput, UsersIcon, CalendarIcon } from "../../components/ui";

const MY_STUDENTS = [
  { id: 1, name: "Nguyễn Thị Bảo Châu", baptism: "Maria", attendance: 96, grade: 9.2, status: "good" },
  { id: 2, name: "Trần Minh Khôi", baptism: "Giuse", attendance: 88, grade: 7.8, status: "ok" },
  { id: 3, name: "Lê Thị Hương Giang", baptism: "Anna", attendance: 100, grade: 9.5, status: "good" },
  { id: 4, name: "Phạm Quốc Hùng", baptism: "Phêrô", attendance: 62, grade: 5.5, status: "attention" },
  { id: 5, name: "Võ Thị Mỹ Linh", baptism: "Têrêxa", attendance: 92, grade: 8.9, status: "good" },
  { id: 6, name: "Đặng Văn Tùng", baptism: "Augustinô", attendance: 85, grade: 7.2, status: "ok" },
  { id: 7, name: "Ngô Thị Lan Anh", baptism: "Cecilia", attendance: 94, grade: 8.5, status: "good" },
  { id: 8, name: "Bùi Thanh Long", baptism: "Micae", attendance: 78, grade: 6.8, status: "ok" },
];

export default function CatechistClasses() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"students" | "schedule">("students");

  const filtered = MY_STUDENTS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.baptism.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="bg-navy-950 px-4 pt-12 pb-5">
        <h1 className="text-white text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Lớp Xưng Tội 1
        </h1>
        <p className="text-white/50 text-xs mt-0.5">Năm học 2024–2025 · Phòng A1</p>

        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: "Học sinh", value: "26", icon: "👥" },
            { label: "Điểm danh TB", value: "96%", icon: "✓" },
            { label: "Điểm TB", value: "8.2", icon: "★" },
          ].map((s, i) => (
            <div key={i} className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{s.value}</p>
              <p className="text-white/50 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-warm-200 flex">
        <button
          onClick={() => setTab("students")}
          className={`flex-1 py-3 text-sm font-medium border-b-2 cursor-pointer ${tab === "students" ? "border-navy-900 text-navy-900" : "border-transparent text-warm-500"}`}
        >
          Danh sách ({MY_STUDENTS.length})
        </button>
        <button
          onClick={() => setTab("schedule")}
          className={`flex-1 py-3 text-sm font-medium border-b-2 cursor-pointer ${tab === "schedule" ? "border-navy-900 text-navy-900" : "border-transparent text-warm-500"}`}
        >
          Lịch học
        </button>
      </div>

      {tab === "students" && (
        <div className="px-4 pt-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Tìm học sinh..." />

          {/* Attention students */}
          {filtered.some(s => s.status === "attention") && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-2xl p-3">
              <p className="text-xs font-semibold text-red-700 mb-2">⚠ Cần chú ý</p>
              {filtered.filter(s => s.status === "attention").map(s => (
                <p key={s.id} className="text-sm text-red-600">{s.name} — điểm danh {s.attendance}%</p>
              ))}
            </div>
          )}

          <div className="mt-3 space-y-2 pb-4">
            {filtered.map((s, i) => (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-warm-200 p-4 flex items-center gap-3"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                  ${s.status === "good" ? "bg-emerald-100 text-emerald-700" :
                    s.status === "attention" ? "bg-red-100 text-red-600" : "bg-warm-100 text-warm-600"}`}
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-warm-900">{s.name}</p>
                  <p className="text-xs text-warm-400">{s.baptism}</p>
                  <div className="flex gap-4 mt-1.5">
                    <div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-xs text-warm-400">Điểm danh</span>
                        <span className={`text-xs font-medium ${s.attendance >= 90 ? "text-emerald-600" : s.attendance >= 75 ? "text-warm-700" : "text-red-600"}`}>
                          {s.attendance}%
                        </span>
                      </div>
                      <div className="w-20 h-1 bg-warm-100 rounded-full">
                        <div
                          className={`h-full rounded-full ${s.attendance >= 90 ? "bg-emerald-500" : s.attendance >= 75 ? "bg-navy-700" : "bg-red-400"}`}
                          style={{ width: `${s.attendance}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-warm-400">Điểm: </span>
                      <span className={`text-xs font-bold ${s.grade >= 9 ? "text-emerald-600" : s.grade >= 7 ? "text-navy-800" : "text-amber-600"}`}>
                        {s.grade}
                      </span>
                    </div>
                  </div>
                </div>
                {s.status === "attention" && (
                  <Badge variant="danger">Chú ý</Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "schedule" && (
        <div className="px-4 pt-4 space-y-3 pb-4">
          {[
            { date: "CN 08/09", topic: "Bí Tích Xưng Tội – Bài 3", done: false, today: true },
            { date: "CN 15/09", topic: "Bí Tích Xưng Tội – Bài 4", done: false, today: false },
            { date: "CN 22/09", topic: "Bí Tích Xưng Tội – Bài 5", done: false, today: false },
            { date: "CN 29/09", topic: "Bí Tích Xưng Tội – Bài 6", done: false, today: false },
            { date: "CN 01/09", topic: "Bí Tích Xưng Tội – Bài 2", done: true, today: false },
            { date: "CN 25/08", topic: "Bí Tích Xưng Tội – Bài 1", done: true, today: false },
          ].map((s, i) => (
            <div
              key={i}
              className={`bg-white rounded-2xl border p-4 flex items-start gap-3
                ${s.today ? "border-navy-200 bg-navy-50/30" : s.done ? "border-warm-100 opacity-60" : "border-warm-200"}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold
                ${s.today ? "bg-navy-900 text-white" : s.done ? "bg-emerald-100 text-emerald-600" : "bg-warm-100 text-warm-500"}`}
                style={{ fontFamily: "var(--font-display)" }}
              >
                {s.done ? "✓" : s.date.split(" ")[1].split("/")[0]}
              </div>
              <div className="flex-1">
                <p className="text-xs text-warm-400">{s.date}</p>
                <p className="text-sm font-semibold text-warm-900 mt-0.5">{s.topic}</p>
              </div>
              {s.today && <Badge variant="navy">Hôm nay</Badge>}
              {s.done && <Badge variant="success">Xong</Badge>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
