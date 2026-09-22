import { useEffect, useState } from "react";
import { Button, CheckCircleIcon, Toast } from "../../components/ui";

type Status = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
type AttendanceStudent = { student: { id: string; fullName: string; baptismalName: string | null }; attendance: { status: Status } | null };
type AttendanceData = { session: { id: string; topic: string; sessionDate: string; startTime: string; endTime: string; class: { name: string } }; students: AttendanceStudent[] };

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const statusConfig: Record<Status, { label: string; short: string; color: string; selected: string }> = {
  PRESENT: { label: "Có mặt", short: "✓", color: "text-emerald-700", selected: "bg-emerald-500 text-white border-emerald-500" },
  ABSENT: { label: "Vắng", short: "✕", color: "text-red-600", selected: "bg-red-500 text-white border-red-400" },
  LATE: { label: "Trễ", short: "⏱", color: "text-amber-700", selected: "bg-amber-400 text-white border-amber-400" },
  EXCUSED: { label: "Phép", short: "P", color: "text-blue-700", selected: "bg-blue-400 text-white border-blue-400" },
};

function getToken() { return localStorage.getItem("authToken") || sessionStorage.getItem("authToken"); }

export default function MobileAttendance({ sessionId, onSaved }: { sessionId?: string; onSaved?: () => void }) {
  const [data, setData] = useState<AttendanceData | null>(null);
  const [attendance, setAttendance] = useState<Record<string, Status>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const loadAttendance = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/attendance`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Không thể tải điểm danh");
      setData(result.data);
      setAttendance(Object.fromEntries(result.data.students.filter((item: AttendanceStudent) => item.attendance).map((item: AttendanceStudent) => [item.student.id, item.attendance!.status])));
    } catch (error) {
      setToast({ msg: error instanceof Error ? error.message : "Không thể tải điểm danh", type: "error" });
    } finally { setLoading(false); }
  };

  useEffect(() => { void loadAttendance(); }, [sessionId]);

  if (loading) return <div className="py-10 text-center text-sm text-warm-400">Đang tải danh sách điểm danh...</div>;
  if (!data) return <div className="py-10 text-center text-sm text-red-600">Không thể tải dữ liệu điểm danh.</div>;

  const total = data.students.length;
  const marked = data.students.filter((item) => attendance[item.student.id]).length;
  const count = (status: Status) => Object.values(attendance).filter((value) => value === status).length;
  const setStatus = (studentId: string, status: Status) => setAttendance((current) => ({ ...current, [studentId]: current[studentId] === status ? undefined as never : status }));
  const markAll = (status: Status) => setAttendance(Object.fromEntries(data.students.map((item) => [item.student.id, status])));

  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/attendance`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify({ records: Object.entries(attendance).filter(([, status]) => status).map(([studentId, status]) => ({ studentId, status })) }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Không thể lưu điểm danh");
      setToast({ msg: "Đã lưu điểm danh", type: "success" });
      onSaved?.();
    } catch (error) { setToast({ msg: error instanceof Error ? error.message : "Không thể lưu điểm danh", type: "error" }); }
    finally { setSaving(false); }
  };

  return (
    <div className="flex flex-col max-h-[70vh]">
      <div className="bg-navy-950 px-4 py-4 text-white rounded-xl mb-3">
        <p className="text-white/60 text-xs">{data.session.class.name}</p>
        <h3 className="text-base font-bold">{data.session.topic}</h3>
        <p className="text-xs text-white/60 mt-1">{new Intl.DateTimeFormat("vi-VN").format(new Date(data.session.sessionDate))} · {data.session.startTime}–{data.session.endTime}</p>
        <div className="grid grid-cols-4 gap-2 mt-3">{(Object.keys(statusConfig) as Status[]).map((status) => <div key={status} className="rounded-lg bg-white/10 p-2 text-center"><strong>{count(status)}</strong><p className="text-[10px] text-white/70">{statusConfig[status].label}</p></div>)}</div>
        <p className="text-xs text-white/60 mt-2">Đã điểm danh {marked}/{total}</p>
      </div>
      <div className="flex gap-2 mb-3"><Button size="sm" variant="secondary" onClick={() => markAll("PRESENT")}>✓ Tất cả có mặt</Button><Button size="sm" variant="ghost" onClick={() => setAttendance({})}>Đặt lại</Button></div>
      <div className="overflow-y-auto divide-y divide-warm-100 border border-warm-200 rounded-lg">
        {data.students.map((item, index) => { const current = attendance[item.student.id]; return <div key={item.student.id} className="bg-white px-3 py-2.5 flex items-center gap-2"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${current ? "bg-navy-100 text-navy-800" : "bg-warm-100 text-warm-500"}`}>{current ? statusConfig[current].short : index + 1}</div><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{item.student.fullName}</p><p className="text-xs text-warm-400">{item.student.baptismalName || "-"}</p></div><div className="flex gap-1">{(Object.keys(statusConfig) as Status[]).map((status) => <button key={status} title={statusConfig[status].label} onClick={() => setStatus(item.student.id, status)} className={`w-8 h-8 rounded-lg border text-xs font-bold cursor-pointer ${current === status ? statusConfig[status].selected : "bg-warm-50 text-warm-400 border-warm-200"}`}>{statusConfig[status].short}</button>)}</div></div>; })}
      </div>
      <Button variant="primary" size="lg" className="w-full mt-3" onClick={() => void save()} disabled={saving}>{saving ? "Đang lưu..." : <span className="flex items-center justify-center gap-2"><CheckCircleIcon size={18} /> Lưu điểm danh</span>}</Button>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
