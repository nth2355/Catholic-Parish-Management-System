import { useEffect, useState } from "react";
import {
    Badge,
    Button,
    CalendarIcon,
    Card,
    CheckCircleIcon,
    Dialog,
    Dropdown,
    EditIcon,
    EmptyState,
    Input,
    PlusIcon,
    SearchInput,
    SectionHeader,
    Select,
    Table,
    Toast,
    TrashIcon,
} from "../../components/ui";

type SessionStatus = "UPCOMING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
type ClassOption = { id: string; name: string };
type AssignmentOption = { id: string; catechist: { fullName: string; baptismalName: string | null } };
type Session = {
  id: string;
  class: ClassOption;
  assignment: AssignmentOption | null;
  topic: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  room: string | null;
  status: SessionStatus;
  _count: { attendances: number };
};
type Form = { classId: string; assignmentId: string; topic: string; sessionDate: string; startTime: string; endTime: string; room: string; status: SessionStatus };

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const emptyForm: Form = { classId: "", assignmentId: "", topic: "", sessionDate: "", startTime: "", endTime: "", room: "", status: "UPCOMING" };
const statusLabels: Record<SessionStatus, string> = { UPCOMING: "Sắp tới", IN_PROGRESS: "Đang diễn ra", COMPLETED: "Hoàn thành", CANCELLED: "Đã hủy" };

function getToken() { return localStorage.getItem("authToken") || sessionStorage.getItem("authToken"); }
function formatDate(value: string) { return new Intl.DateTimeFormat("vi-VN").format(new Date(value)); }

export default function SessionManagement() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [assignments, setAssignments] = useState<AssignmentOption[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Session | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => { setToast({ message, type }); setTimeout(() => setToast(null), 3000); };
  const request = async (path: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...options.headers } });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Không thể thực hiện thao tác");
    return result;
  };

  const loadSessions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const [sessionResult, classResult] = await Promise.all([request(`/sessions?${params}`), request("/classes")]);
      setSessions(sessionResult.data);
      setClasses(classResult.data);
    } catch (error) { showToast(error instanceof Error ? error.message : "Không thể tải buổi học", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { void loadSessions(); }, [search, statusFilter]);

  const updateForm = (field: keyof Form, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const openCreate = () => { setEditing(null); setForm({ ...emptyForm, classId: classes[0]?.id || "" }); setAssignments([]); setShowDialog(true); };
  const openEdit = async (session: Session) => {
    setEditing(session);
    setForm({ classId: session.class.id, assignmentId: session.assignment?.id || "", topic: session.topic, sessionDate: session.sessionDate.slice(0, 10), startTime: session.startTime, endTime: session.endTime, room: session.room || "", status: session.status });
    await loadAssignments(session.class.id);
    setShowDialog(true);
  };
  const loadAssignments = async (classId: string) => {
    try { const result = await request(`/classes/${classId}/assignments`); setAssignments(result.data); }
    catch (error) { showToast(error instanceof Error ? error.message : "Không thể tải giáo lý viên", "error"); }
  };
  const changeClass = (classId: string) => { updateForm("classId", classId); updateForm("assignmentId", ""); void loadAssignments(classId); };

  const saveSession = async () => {
    if (!form.classId || !form.topic.trim() || !form.sessionDate || !form.startTime || !form.endTime) { showToast("Vui lòng nhập đủ thông tin buổi học", "error"); return; }
    setSaving(true);
    try {
      const payload = { ...form, assignmentId: form.assignmentId || null, room: form.room || null };
      await request(`/sessions${editing ? `/${editing.id}` : ""}`, { method: editing ? "PATCH" : "POST", body: JSON.stringify(payload) });
      setShowDialog(false); showToast(editing ? "Đã cập nhật buổi học" : "Đã tạo buổi học"); await loadSessions();
    } catch (error) { showToast(error instanceof Error ? error.message : "Không thể lưu buổi học", "error"); }
    finally { setSaving(false); }
  };
  const deleteSession = async (session: Session) => {
    if (!window.confirm(`Xóa buổi học ${session.topic}?`)) return;
    try { await request(`/sessions/${session.id}`, { method: "DELETE" }); showToast("Đã xóa buổi học"); await loadSessions(); }
    catch (error) { showToast(error instanceof Error ? error.message : "Không thể xóa buổi học", "error"); }
  };

  const completed = sessions.filter((session) => session.status === "COMPLETED").length;
  const upcoming = sessions.filter((session) => session.status === "UPCOMING").length;

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      <SectionHeader title="Quản lý buổi học" subtitle={`${sessions.length} buổi học`} action={<Button variant="primary" onClick={openCreate}><PlusIcon size={14} /> Tạo buổi học</Button>} />
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4"><p className="text-xs text-warm-500">Tổng buổi học</p><p className="text-2xl font-bold text-navy-900 mt-1">{sessions.length}</p></Card>
        <Card className="p-4"><p className="text-xs text-warm-500">Hoàn thành</p><p className="text-2xl font-bold text-emerald-700 mt-1">{completed}</p></Card>
        <Card className="p-4"><p className="text-xs text-warm-500">Sắp tới</p><p className="text-2xl font-bold text-gold-600 mt-1">{upcoming}</p></Card>
      </div>
      <Card>
        <div className="p-4 border-b border-warm-100 flex gap-3 items-center"><div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Tìm lớp, chủ đề..." /></div><Select value={statusFilter} onChange={setStatusFilter} placeholder="Tất cả trạng thái" options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))} className="w-44" /></div>
        {loading ? <div className="py-16 text-center text-sm text-warm-400">Đang tải buổi học...</div> : sessions.length === 0 ? <EmptyState icon={<CalendarIcon size={40} />} title="Chưa có buổi học" description="Tạo buổi học đầu tiên cho một lớp" /> : <Table headers={["Lớp học", "Chủ đề", "Giáo lý viên", "Ngày", "Giờ", "Phòng", "Điểm danh", "Trạng thái", ""]} rows={sessions.map((session) => [
          <span className="font-medium text-warm-900">{session.class.name}</span>,
          <span className="text-warm-600 max-w-48 block truncate">{session.topic}</span>,
          session.assignment ? <span className="text-warm-500 text-sm">{session.assignment.catechist.fullName}</span> : <Badge variant="warning">Chưa phân công</Badge>,
          <span className="text-warm-500 text-sm">{formatDate(session.sessionDate)}</span>,
          <span className="text-warm-500 text-sm">{session.startTime}–{session.endTime}</span>,
          <span className="text-warm-500 text-sm">{session.room || "-"}</span>,
          <span className="text-warm-500 text-sm">{session._count.attendances}</span>,
          <Badge variant={session.status === "COMPLETED" ? "success" : session.status === "IN_PROGRESS" ? "navy" : session.status === "CANCELLED" ? "danger" : "muted"}>{statusLabels[session.status]}</Badge>,
          <Dropdown dropUp trigger={<button className="text-warm-400 hover:text-warm-700 p-1 rounded cursor-pointer"><span className="text-lg leading-none">···</span></button>} items={[{ label: "Điểm danh", icon: <CheckCircleIcon size={14} />, onClick: () => showToast("Chức năng điểm danh sẽ thực hiện ở bước tiếp theo") }, { label: "Chỉnh sửa", icon: <EditIcon />, onClick: () => void openEdit(session) }, { label: "Xóa", icon: <TrashIcon />, danger: true, onClick: () => void deleteSession(session) }]} />,
        ])} />}
        <div className="px-4 py-3 border-t border-warm-100"><p className="text-xs text-warm-400">Hiển thị {sessions.length} buổi học</p></div>
      </Card>
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title={editing ? "Chỉnh sửa buổi học" : "Tạo buổi học mới"} footer={<><Button variant="secondary" onClick={() => setShowDialog(false)}>Hủy</Button><Button variant="primary" onClick={() => void saveSession()} disabled={saving}>{saving ? "Đang lưu..." : "Lưu"}</Button></>}>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Lớp học" value={form.classId} onChange={changeClass} options={classes.map((item) => ({ value: item.id, label: item.name }))} placeholder="Chọn lớp" className="col-span-2" />
          <Input label="Chủ đề bài giảng" value={form.topic} onChange={(value) => updateForm("topic", value)} className="col-span-2" />
          <Select label="Giáo lý viên (tùy chọn)" value={form.assignmentId} onChange={(value) => updateForm("assignmentId", value)} options={assignments.map((item) => ({ value: item.id, label: `${item.catechist.fullName}${item.catechist.baptismalName ? ` - ${item.catechist.baptismalName}` : ""}` }))} placeholder="Chưa phân công" />
          <Select label="Trạng thái" value={form.status} onChange={(value) => updateForm("status", value)} options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))} />
          <Input label="Ngày học" type="date" value={form.sessionDate} onChange={(value) => updateForm("sessionDate", value)} />
          <Input label="Phòng học (tùy chọn)" value={form.room} onChange={(value) => updateForm("room", value)} />
          <Input label="Giờ bắt đầu" type="time" value={form.startTime} onChange={(value) => updateForm("startTime", value)} />
          <Input label="Giờ kết thúc" type="time" value={form.endTime} onChange={(value) => updateForm("endTime", value)} />
        </div>
      </Dialog>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
