import { useEffect, useState } from "react";
import { Badge, Button, ProgressBar } from "../../components/ui";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
type ClassRecord = { id: string; name: string; capacity: number; _count: { enrollments: number } };
type Session = { id: string; class: { name: string }; topic: string; sessionDate: string; startTime: string; endTime: string; room: string | null; status: string };
function getToken() { return localStorage.getItem("authToken") || sessionStorage.getItem("authToken"); }

export default function CatechistHome({ onAttend }: { onAttend: () => void }) {
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem("authUser") || sessionStorage.getItem("authUser") || "{}") as { fullName?: string | null; baptismalName?: string | null };
  const name = user.fullName || user.baptismalName || "Giáo lý viên";

  useEffect(() => {
    const headers = { Authorization: `Bearer ${getToken()}` };
    Promise.all([fetch(`${API_BASE_URL}/classes`, { headers }), fetch(`${API_BASE_URL}/sessions`, { headers })])
      .then(async ([classesResponse, sessionsResponse]) => {
        const classesResult = await classesResponse.json();
        const sessionsResult = await sessionsResponse.json();
        if (!classesResponse.ok) throw new Error(classesResult.message || "Không thể tải lớp học");
        if (!sessionsResponse.ok) throw new Error(sessionsResult.message || "Không thể tải buổi học");
        setClasses(classesResult.data);
        setSessions(sessionsResult.data.slice(0, 4));
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Không thể tải dữ liệu"));
  }, []);

  const nextSession = sessions.find((session) => session.status !== "COMPLETED" && session.status !== "CANCELLED");
  const firstClass = classes[0];
  return (
    <div className="pb-4">
      <div className="bg-navy-950 px-5 pt-12 pb-6">
        <p className="text-white/60 text-sm">Xin chào,</p>
        <h1 className="text-white text-xl font-bold mt-0.5" style={{ fontFamily: "var(--font-display)" }}>{name}</h1>
        <p className="text-white/50 text-xs mt-1">{classes.length ? `${classes.length} lớp được phân công` : "Chưa có lớp được phân công"}</p>
        {nextSession && <div className="mt-4 bg-white/10 rounded-2xl p-4 border border-white/10">
          <div className="flex items-start justify-between">
            <div><p className="text-white/60 text-xs">Buổi học tiếp theo</p><p className="text-white font-semibold mt-1">{nextSession.topic}</p><p className="text-white/60 text-xs mt-1">{nextSession.class.name} · {new Date(nextSession.sessionDate).toLocaleDateString("vi-VN")} · {nextSession.startTime}–{nextSession.endTime}</p></div>
            <Badge variant="gold">{nextSession.status === "IN_PROGRESS" ? "Đang diễn ra" : "Sắp tới"}</Badge>
          </div>
          <Button variant="primary" size="sm" className="w-full mt-3" onClick={onAttend}>Mở điểm danh</Button>
        </div>}
      </div>
      {error && <p className="px-4 mt-4 text-sm text-red-600">{error}</p>}
      <div className="px-4 -mt-2">
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white rounded-2xl p-4 border border-warm-200 shadow-sm"><p className="text-xs text-warm-500">Lớp phụ trách</p><p className="text-2xl font-bold text-navy-900 mt-1">{classes.length}</p><p className="text-xs text-warm-400">Lớp đang hoạt động</p></div>
          <div className="bg-white rounded-2xl p-4 border border-warm-200 shadow-sm"><p className="text-xs text-warm-500">Sĩ số lớp đầu tiên</p><p className="text-2xl font-bold text-emerald-600 mt-1">{firstClass?._count.enrollments ?? "—"}</p><p className="text-xs text-warm-400">/{firstClass?.capacity ?? "—"} học sinh</p><ProgressBar value={firstClass?._count.enrollments ?? 0} max={firstClass?.capacity || 1} color="green" className="mt-2" /></div>
        </div>
      </div>
      <div className="px-4 mt-5"><h2 className="text-sm font-bold text-warm-900 mb-3">Lịch học sắp tới</h2><div className="space-y-2.5">{sessions.map((session) => <div key={session.id} className="bg-white rounded-2xl p-4 border border-warm-200 flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-warm-100 text-warm-600 flex flex-col items-center justify-center"><span className="text-xs">{new Date(session.sessionDate).toLocaleDateString("vi-VN", { weekday: "short" })}</span><span className="text-lg font-bold">{new Date(session.sessionDate).getDate()}</span></div><div className="flex-1 min-w-0"><p className="text-sm font-semibold text-warm-900 truncate">{session.topic}</p><p className="text-xs text-warm-400">{session.class.name} · {session.startTime} · {session.room || "Chưa xếp phòng"}</p></div><Badge variant={session.status === "COMPLETED" ? "success" : "navy"}>{session.status === "COMPLETED" ? "Xong" : "Sắp tới"}</Badge></div>)}</div></div>
    </div>
  );
}
