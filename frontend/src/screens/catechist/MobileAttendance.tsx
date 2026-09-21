import { useState } from "react";
import { Badge, Button, Select, Toast, AlertTriangleIcon, CheckCircleIcon, ChevronDownIcon } from "../../components/ui";

type Status = "present" | "absent" | "late" | "excused" | null;

const statusConfig: Record<NonNullable<Status>, { label: string; short: string; color: string; bg: string; border: string }> = {
  present: { label: "Có mặt", short: "✓", color: "text-emerald-700", bg: "bg-emerald-500", border: "border-emerald-500" },
  absent: { label: "Vắng", short: "✕", color: "text-red-600", bg: "bg-red-500", border: "border-red-400" },
  late: { label: "Trễ", short: "⏱", color: "text-amber-700", bg: "bg-amber-400", border: "border-amber-400" },
  excused: { label: "Phép", short: "P", color: "text-blue-700", bg: "bg-blue-400", border: "border-blue-400" },
};

const STUDENTS = [
  { id: 1, name: "Nguyễn Thị Bảo Châu", baptism: "Maria" },
  { id: 2, name: "Trần Minh Khôi", baptism: "Giuse" },
  { id: 3, name: "Lê Thị Hương Giang", baptism: "Anna" },
  { id: 4, name: "Phạm Quốc Hùng", baptism: "Phêrô" },
  { id: 5, name: "Võ Thị Mỹ Linh", baptism: "Têrêxa" },
  { id: 6, name: "Đặng Văn Tùng", baptism: "Augustinô" },
  { id: 7, name: "Ngô Thị Lan Anh", baptism: "Cecilia" },
  { id: 8, name: "Bùi Thanh Long", baptism: "Micae" },
  { id: 9, name: "Hoàng Thị Thu Hà", baptism: "Têrêxa" },
  { id: 10, name: "Đinh Văn Khải", baptism: "Gioan" },
  { id: 11, name: "Phan Thị Diễm Quỳnh", baptism: "Rosa" },
  { id: 12, name: "Lý Minh Tuấn", baptism: "Phaolô" },
  { id: 13, name: "Trịnh Thị Khánh Linh", baptism: "Lucia" },
  { id: 14, name: "Vương Văn Đức", baptism: "Đaminh" },
  { id: 15, name: "Đỗ Thị Thanh Mai", baptism: "Maria" },
  { id: 16, name: "Nguyễn Văn Huy", baptism: "Giuse" },
];

export default function MobileAttendance() {
  const [attendance, setAttendance] = useState<Record<number, Status>>({});
  const [saved, setSaved] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "warning" | "error" } | null>(null);
  const [session, setSession] = useState("xt1-08-09");
  const [showClassPicker, setShowClassPicker] = useState(false);

  const total = STUDENTS.length;
  const marked = STUDENTS.filter(s => attendance[s.id] !== null && attendance[s.id] !== undefined).length;
  const presentCount = STUDENTS.filter(s => attendance[s.id] === "present").length;
  const absentCount = STUDENTS.filter(s => attendance[s.id] === "absent").length;
  const lateCount = STUDENTS.filter(s => attendance[s.id] === "late").length;
  const excusedCount = STUDENTS.filter(s => attendance[s.id] === "excused").length;
  const unmarked = total - marked;

  const setStatus = (id: number, status: Status) => {
    setAttendance(prev => ({ ...prev, [id]: prev[id] === status ? null : status }));
  };

  const markAll = (status: Status) => {
    const newAtt: Record<number, Status> = {};
    STUDENTS.forEach(s => { newAtt[s.id] = status; });
    setAttendance(newAtt);
  };

  const handleSave = () => {
    if (unmarked > 0) {
      setShowWarning(true);
      return;
    }
    doSave();
  };

  const doSave = () => {
    setSaved(true);
    setShowWarning(false);
    setToast({ msg: `Đã lưu điểm danh! ${presentCount} có mặt, ${absentCount} vắng, ${lateCount} trễ, ${excusedCount} phép.`, type: "success" });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-navy-950 px-4 pt-12 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white/50 text-xs">Điểm danh</p>
            <h1 className="text-white text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>
              Lớp Xưng Tội 1
            </h1>
          </div>
          <div className="bg-white/10 rounded-xl px-3 py-2 flex items-center gap-2 cursor-pointer" onClick={() => setShowClassPicker(!showClassPicker)}>
            <span className="text-white/80 text-xs">CN 08/09 · 08:00</span>
            <ChevronDownIcon size={12} />
          </div>
        </div>

        {/* Live counters */}
        <div className="grid grid-cols-4 gap-2 mt-1">
          {[
            { label: "Có mặt", count: presentCount, color: "bg-emerald-500/20 text-emerald-300" },
            { label: "Vắng", count: absentCount, color: "bg-red-500/20 text-red-300" },
            { label: "Trễ", count: lateCount, color: "bg-amber-400/20 text-amber-300" },
            { label: "Phép", count: excusedCount, color: "bg-blue-400/20 text-blue-300" },
          ].map((c, i) => (
            <div key={i} className={`${c.color} rounded-xl p-2 text-center`}>
              <p className="text-xl font-bold leading-none" style={{ fontFamily: "var(--font-display)" }}>{c.count}</p>
              <p className="text-xs mt-0.5 opacity-80">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-white/50 mb-1.5">
            <span>Đã điểm danh {marked}/{total}</span>
            {unmarked > 0 && <span className="text-amber-300">{unmarked} chưa đánh dấu</span>}
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold-500 rounded-full transition-all duration-300"
              style={{ width: `${(marked / total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white border-b border-warm-200 px-4 py-2.5 flex gap-2 overflow-x-auto">
        <button
          onClick={() => markAll("present")}
          className="flex-shrink-0 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer hover:bg-emerald-100"
        >
          ✓ Tất cả có mặt
        </button>
        <button
          onClick={() => setAttendance({})}
          className="flex-shrink-0 bg-warm-100 text-warm-600 text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer hover:bg-warm-200"
        >
          Đặt lại
        </button>
        {[
          { label: "Lọc: Chưa đánh dấu", color: "bg-amber-50 text-amber-700 border border-amber-200" },
        ].map((a, i) => (
          <button key={i} className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer ${a.color}`}>
            {a.label}
          </button>
        ))}
      </div>

      {/* Student list */}
      <div className="flex-1 overflow-y-auto bg-warm-50">
        <div className="divide-y divide-warm-100">
          {STUDENTS.map((student, idx) => {
            const currentStatus = attendance[student.id] || null;
            return (
              <div
                key={student.id}
                className={`bg-white px-4 flex items-center gap-3 transition-colors
                  ${currentStatus ? "bg-white" : "bg-white"}`}
                style={{ minHeight: 72 }}
              >
                {/* Index + avatar */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold
                      ${currentStatus === "present" ? "bg-emerald-100 text-emerald-700" :
                        currentStatus === "absent" ? "bg-red-100 text-red-600" :
                        currentStatus === "late" ? "bg-amber-100 text-amber-700" :
                        currentStatus === "excused" ? "bg-blue-100 text-blue-700" :
                        "bg-warm-100 text-warm-500"}`}
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {currentStatus ? statusConfig[currentStatus].short : idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-warm-900 leading-tight">{student.name}</p>
                    <p className="text-xs text-warm-400">{student.baptism}</p>
                  </div>
                </div>

                {/* Status buttons */}
                <div className="flex gap-1.5 flex-shrink-0">
                  {(["present", "absent", "late", "excused"] as NonNullable<Status>[]).map(s => (
                    <button
                      key={s}
                      onClick={() => setStatus(student.id, s)}
                      className={`w-11 h-11 rounded-xl text-xs font-bold cursor-pointer transition-all border-2
                        ${currentStatus === s
                          ? `${statusConfig[s].bg} text-white ${statusConfig[s].border} scale-105`
                          : "bg-warm-50 text-warm-400 border-warm-200 hover:border-warm-300"}`}
                    >
                      {statusConfig[s].short}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Warning overlay */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
          <div className="bg-white rounded-t-3xl w-full max-w-md p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangleIcon size={20} />
              </div>
              <div>
                <h3 className="font-bold text-warm-900" style={{ fontFamily: "var(--font-display)" }}>
                  Chưa điểm danh đủ
                </h3>
                <p className="text-sm text-warm-500 mt-1">
                  Còn <strong>{unmarked} học sinh</strong> chưa được đánh dấu. Bạn có muốn lưu không?
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowWarning(false)}
                className="flex-1 py-3 rounded-xl border border-warm-200 text-warm-700 font-medium text-sm cursor-pointer hover:bg-warm-50"
              >
                Tiếp tục điểm danh
              </button>
              <button
                onClick={doSave}
                className="flex-1 py-3 rounded-xl bg-navy-900 text-white font-medium text-sm cursor-pointer hover:bg-navy-800"
              >
                Lưu ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save button */}
      <div className="bg-white border-t border-warm-200 px-4 py-3 pb-safe">
        <button
          onClick={handleSave}
          disabled={saved}
          className={`w-full py-4 rounded-2xl text-base font-bold cursor-pointer transition-all
            ${saved
              ? "bg-emerald-500 text-white"
              : "bg-navy-900 text-white hover:bg-navy-800 active:scale-98"}`}
          style={{ fontFamily: "var(--font-display)" }}
        >
          {saved ? (
            <span className="flex items-center justify-center gap-2">
              <CheckCircleIcon size={20} /> Đã lưu điểm danh
            </span>
          ) : (
            `Lưu điểm danh${unmarked > 0 ? ` (${unmarked} chưa đánh dấu)` : ""}`
          )}
        </button>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
