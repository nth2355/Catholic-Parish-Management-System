import { useEffect, useState } from "react";
import {
    Badge,
    BookOpenIcon,
    Button,
    Card,
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

type ClassLevel = "TIM_HIEU" | "XUNG_TOI" | "RUOC_LE" | "THEM_SUC";
type ClassStatus = "ACTIVE" | "PAUSED" | "COMPLETED";

type AcademicYear = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
};

type ParishClass = {
  id: string;
  name: string;
  level: ClassLevel;
  capacity: number;
  room: string | null;
  dayOfWeek: number | null;
  startTime: string | null;
  endTime: string | null;
  status: ClassStatus;
  academicYearId: string;
  academicYear: AcademicYear;
  _count: { enrollments: number };
  assignments: { id: string; role: "PRIMARY" | "ASSISTANT"; catechist: { id: string; fullName: string; baptismalName: string | null } }[];
};
type CatechistOption = { id: string; fullName: string; baptismalName: string | null };
type Assignment = { id: string; role: "PRIMARY" | "ASSISTANT"; catechist: CatechistOption };

type ClassForm = {
  name: string;
  level: ClassLevel;
  capacity: string;
  room: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  status: ClassStatus;
  academicYearId: string;
};

type YearForm = { name: string; startDate: string; endDate: string };

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const levelLabels: Record<ClassLevel, string> = {
  TIM_HIEU: "Tìm Hiểu",
  XUNG_TOI: "Xưng Tội",
  RUOC_LE: "Rước Lễ",
  THEM_SUC: "Thêm Sức",
};
const dayLabels = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
const emptyClass: ClassForm = {
  name: "",
  level: "TIM_HIEU",
  capacity: "30",
  room: "",
  dayOfWeek: "",
  startTime: "",
  endTime: "",
  status: "ACTIVE",
  academicYearId: "",
};
const emptyYear: YearForm = { name: "", startDate: "", endDate: "" };

function getToken() {
  return localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
}

function classToForm(classRecord: ParishClass): ClassForm {
  return {
    name: classRecord.name,
    level: classRecord.level,
    capacity: String(classRecord.capacity),
    room: classRecord.room || "",
    dayOfWeek: classRecord.dayOfWeek === null ? "" : String(classRecord.dayOfWeek),
    startTime: classRecord.startTime || "",
    endTime: classRecord.endTime || "",
    status: classRecord.status,
    academicYearId: classRecord.academicYearId,
  };
}

export default function ClassManagement() {
  const [classes, setClasses] = useState<ParishClass[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [showClassDialog, setShowClassDialog] = useState(false);
  const [showYearDialog, setShowYearDialog] = useState(false);
  const [showRosterDialog, setShowRosterDialog] = useState(false);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [editingClass, setEditingClass] = useState<ParishClass | null>(null);
  const [rosterClass, setRosterClass] = useState<ParishClass | null>(null);
  const [roster, setRoster] = useState<{ id: string; status: string; student: { id: string; fullName: string; baptismalName: string | null } }[]>([]);
  const [availableStudents, setAvailableStudents] = useState<{ id: string; fullName: string; baptismalName: string | null }[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [assignmentClass, setAssignmentClass] = useState<ParishClass | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [catechistOptions, setCatechistOptions] = useState<CatechistOption[]>([]);
  const [selectedCatechistId, setSelectedCatechistId] = useState("");
  const [assignmentRole, setAssignmentRole] = useState("PRIMARY");
  const [classForm, setClassForm] = useState<ClassForm>(emptyClass);
  const [yearForm, setYearForm] = useState<YearForm>(emptyYear);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const request = async (path: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
        ...options.headers,
      },
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Không thể thực hiện thao tác");
    return result;
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (levelFilter) params.set("level", levelFilter);
      if (yearFilter) params.set("academicYearId", yearFilter);
      const [yearResult, classResult, catechistResult] = await Promise.all([
        request("/classes/academic-years"),
        request(`/classes?${params}`),
        request("/catechists?status=ACTIVE"),
      ]);
      setYears(yearResult.data);
      setClasses(classResult.data);
      setCatechistOptions(catechistResult.data);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể tải dữ liệu lớp học", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [search, levelFilter, yearFilter]);

  const openCreateClass = () => {
    setEditingClass(null);
    setClassForm({ ...emptyClass, academicYearId: yearFilter || years[0]?.id || "" });
    setShowClassDialog(true);
  };

  const openEditClass = (classRecord: ParishClass) => {
    setEditingClass(classRecord);
    setClassForm(classToForm(classRecord));
    setShowClassDialog(true);
  };

  const updateClassForm = (field: keyof ClassForm, value: string) => {
    setClassForm((current) => ({ ...current, [field]: value }));
  };

  const saveClass = async () => {
    if (!classForm.name.trim() || !classForm.academicYearId) {
      showToast("Vui lòng nhập tên lớp và chọn năm học", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...classForm,
        capacity: Number(classForm.capacity),
        dayOfWeek: classForm.dayOfWeek === "" ? null : Number(classForm.dayOfWeek),
        room: classForm.room || null,
        startTime: classForm.startTime || null,
        endTime: classForm.endTime || null,
      };
      await request(`/classes${editingClass ? `/${editingClass.id}` : ""}`, {
        method: editingClass ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      setShowClassDialog(false);
      showToast(editingClass ? "Đã cập nhật lớp học" : "Đã tạo lớp học");
      await loadData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể lưu lớp học", "error");
    } finally {
      setSaving(false);
    }
  };

  const createYear = async () => {
    if (!yearForm.name || !yearForm.startDate || !yearForm.endDate) {
      showToast("Vui lòng nhập đủ thông tin năm học", "error");
      return;
    }
    setSaving(true);
    try {
      const result = await request("/classes/academic-years", { method: "POST", body: JSON.stringify(yearForm) });
      setYears((current) => [result.data, ...current]);
      setClassForm((current) => ({ ...current, academicYearId: result.data.id }));
      setYearForm(emptyYear);
      setShowYearDialog(false);
      showToast("Đã tạo năm học");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể tạo năm học", "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteClass = async (classRecord: ParishClass) => {
    if (!window.confirm(`Xóa lớp ${classRecord.name}?`)) return;
    try {
      await request(`/classes/${classRecord.id}`, { method: "DELETE" });
      showToast("Đã xóa lớp học");
      await loadData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể xóa lớp học", "error");
    }
  };

  const openRoster = async (classRecord: ParishClass) => {
    setRosterClass(classRecord);
    setShowRosterDialog(true);
    setRosterLoading(true);
    try {
      const [rosterResult, studentResult] = await Promise.all([
        request(`/classes/${classRecord.id}/students`),
        request("/students?limit=100&status=ACTIVE"),
      ]);
      setRoster(rosterResult.data);
      setAvailableStudents(studentResult.data);
      setSelectedStudentIds([]);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể tải danh sách lớp", "error");
    } finally {
      setRosterLoading(false);
    }
  };

  const addStudentsToClass = async () => {
    if (!rosterClass || selectedStudentIds.length === 0) return;
    try {
      await Promise.all(selectedStudentIds.map((studentId) => request(`/classes/${rosterClass.id}/students`, {
        method: "POST",
        body: JSON.stringify({ studentId }),
      })));
      showToast(`Đã thêm ${selectedStudentIds.length} học sinh vào lớp`);
      await openRoster(rosterClass);
      await loadData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể thêm học sinh vào lớp", "error");
    }
  };

  const removeStudentFromClass = async (studentId: string) => {
    if (!rosterClass || !window.confirm("Xóa học sinh này khỏi lớp?")) return;
    try {
      await request(`/classes/${rosterClass.id}/students/${studentId}`, { method: "DELETE" });
      showToast("Đã xóa học sinh khỏi lớp");
      await openRoster(rosterClass);
      await loadData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể xóa học sinh khỏi lớp", "error");
    }
  };

  const openAssignments = async (classRecord: ParishClass) => {
    setAssignmentClass(classRecord);
    setShowAssignmentDialog(true);
    try {
      const result = await request(`/classes/${classRecord.id}/assignments`);
      setAssignments(result.data);
      setSelectedCatechistId("");
      setAssignmentRole("PRIMARY");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể tải phân công", "error");
    }
  };

  const addAssignment = async () => {
    if (!assignmentClass || !selectedCatechistId) return;
    try {
      await request(`/classes/${assignmentClass.id}/assignments`, {
        method: "POST",
        body: JSON.stringify({ catechistId: selectedCatechistId, role: assignmentRole }),
      });
      showToast("Đã phân công giáo lý viên");
      await openAssignments(assignmentClass);
      await loadData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể phân công giáo lý viên", "error");
    }
  };

  const endAssignment = async (assignmentId: string) => {
    if (!assignmentClass || !window.confirm("Kết thúc phân công này?")) return;
    try {
      await request(`/classes/${assignmentClass.id}/assignments/${assignmentId}`, { method: "DELETE" });
      showToast("Đã kết thúc phân công");
      await openAssignments(assignmentClass);
      await loadData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể kết thúc phân công", "error");
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      <SectionHeader
        title="Quản lý lớp học"
        subtitle={`${classes.length} lớp học`}
        action={<Button variant="primary" onClick={openCreateClass}><PlusIcon size={14} /> Tạo lớp mới</Button>}
      />

      <Card>
        <div className="p-4 border-b border-warm-100 flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-44"><SearchInput value={search} onChange={setSearch} placeholder="Tìm lớp học..." /></div>
          <Select value={levelFilter} onChange={setLevelFilter} placeholder="Tất cả khối" options={Object.entries(levelLabels).map(([value, label]) => ({ value, label }))} className="w-36" />
          <Select value={yearFilter} onChange={setYearFilter} placeholder="Tất cả năm học" options={years.map((year) => ({ value: year.id, label: year.name }))} className="w-44" />
          <Button variant="secondary" size="sm" onClick={() => setShowYearDialog(true)}>Tạo năm học</Button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-warm-400">Đang tải danh sách lớp...</div>
        ) : classes.length === 0 ? (
          <EmptyState icon={<BookOpenIcon size={40} />} title="Chưa có lớp học" description={years.length ? "Tạo lớp học đầu tiên cho năm học" : "Hãy tạo năm học trước khi tạo lớp"} />
        ) : (
          <Table
            headers={["Lớp học", "Khối", "Năm học", "Giáo lý viên", "Học sinh", "Lịch học", "Phòng", "Trạng thái", ""]}
            rows={classes.map((classRecord) => [
              <span className="font-medium text-warm-900">{classRecord.name}</span>,
              <Badge variant={classRecord.level === "THEM_SUC" ? "gold" : classRecord.level === "RUOC_LE" ? "success" : "navy"}>{levelLabels[classRecord.level]}</Badge>,
              <span className="text-xs text-warm-500">{classRecord.academicYear.name}</span>,
              <div className="flex flex-col gap-1">{classRecord.assignments?.length ? classRecord.assignments.map((assignment) => <Badge key={assignment.id} variant={assignment.role === "PRIMARY" ? "navy" : "default"}>{assignment.catechist.fullName}</Badge>) : <Badge variant="warning">Chưa phân công</Badge>}</div>,
              <span className="text-warm-700">{classRecord._count.enrollments} / {classRecord.capacity}</span>,
              <span className="text-xs text-warm-500">{classRecord.dayOfWeek === null ? "-" : `${dayLabels[classRecord.dayOfWeek]} ${classRecord.startTime || ""}`}</span>,
              <span className="text-xs text-warm-500">{classRecord.room || "-"}</span>,
              <Badge variant={classRecord.status === "ACTIVE" ? "success" : classRecord.status === "PAUSED" ? "warning" : "muted"}>{classRecord.status === "ACTIVE" ? "Đang hoạt động" : classRecord.status === "PAUSED" ? "Tạm dừng" : "Đã hoàn thành"}</Badge>,
              <Dropdown dropUp trigger={<button className="text-warm-400 hover:text-warm-700 p-1 rounded cursor-pointer"><span className="text-lg leading-none">···</span></button>} items={[{ label: "Danh sách học sinh", onClick: () => void openRoster(classRecord) }, { label: "Phân công giáo lý viên", onClick: () => void openAssignments(classRecord) }, { label: "Chỉnh sửa", icon: <EditIcon />, onClick: () => openEditClass(classRecord) }, { label: "Xóa lớp", icon: <TrashIcon />, danger: true, onClick: () => void deleteClass(classRecord) }]} />,
            ])}
          />
        )}
        <div className="px-4 py-3 border-t border-warm-100"><p className="text-xs text-warm-400">Hiển thị {classes.length} lớp học</p></div>
      </Card>

      <Dialog open={showClassDialog} onClose={() => setShowClassDialog(false)} title={editingClass ? "Chỉnh sửa lớp học" : "Tạo lớp học mới"} footer={<><Button variant="secondary" onClick={() => setShowClassDialog(false)}>Hủy</Button><Button variant="primary" onClick={() => void saveClass()} disabled={saving}>{saving ? "Đang lưu..." : "Lưu lớp học"}</Button></>}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Tên lớp" value={classForm.name} onChange={(value) => updateClassForm("name", value)} className="col-span-2" />
          <Select label="Khối" value={classForm.level} onChange={(value) => updateClassForm("level", value)} options={Object.entries(levelLabels).map(([value, label]) => ({ value, label }))} />
          <Select label="Năm học" value={classForm.academicYearId} onChange={(value) => updateClassForm("academicYearId", value)} options={years.map((year) => ({ value: year.id, label: year.name }))} placeholder="Chọn năm học" />
          <Input label="Sĩ số tối đa" type="number" value={classForm.capacity} onChange={(value) => updateClassForm("capacity", value)} />
          <Input label="Phòng học (tùy chọn)" value={classForm.room} onChange={(value) => updateClassForm("room", value)} />
          <Select label="Ngày học (tùy chọn)" value={classForm.dayOfWeek} onChange={(value) => updateClassForm("dayOfWeek", value)} options={dayLabels.map((label, value) => ({ value: String(value), label }))} placeholder="Chọn ngày" />
          <Input label="Giờ bắt đầu (tùy chọn)" type="time" value={classForm.startTime} onChange={(value) => updateClassForm("startTime", value)} />
          <Input label="Giờ kết thúc (tùy chọn)" type="time" value={classForm.endTime} onChange={(value) => updateClassForm("endTime", value)} />
          <Select label="Trạng thái" value={classForm.status} onChange={(value) => updateClassForm("status", value)} options={[{ value: "ACTIVE", label: "Đang hoạt động" }, { value: "PAUSED", label: "Tạm dừng" }, { value: "COMPLETED", label: "Đã hoàn thành" }]} />
        </div>
      </Dialog>

      <Dialog open={showYearDialog} onClose={() => setShowYearDialog(false)} title="Tạo năm học" footer={<><Button variant="secondary" onClick={() => setShowYearDialog(false)}>Hủy</Button><Button variant="primary" onClick={() => void createYear()} disabled={saving}>{saving ? "Đang lưu..." : "Lưu năm học"}</Button></>}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Tên năm học" placeholder="2026–2027" value={yearForm.name} onChange={(value) => setYearForm((current) => ({ ...current, name: value }))} className="col-span-2" />
          <Input label="Ngày bắt đầu" type="date" value={yearForm.startDate} onChange={(value) => setYearForm((current) => ({ ...current, startDate: value }))} />
          <Input label="Ngày kết thúc" type="date" value={yearForm.endDate} onChange={(value) => setYearForm((current) => ({ ...current, endDate: value }))} />
        </div>
      </Dialog>

      <Dialog open={showRosterDialog} onClose={() => setShowRosterDialog(false)} title={rosterClass ? `Học sinh - ${rosterClass.name}` : "Danh sách học sinh"}>
        {rosterLoading ? (
          <p className="py-8 text-center text-sm text-warm-400">Đang tải danh sách...</p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-warm-700">Thêm học sinh</p>
              <div className="max-h-48 overflow-y-auto border border-warm-200 rounded-lg divide-y divide-warm-100">
                {availableStudents.filter((student) => !roster.some((item) => item.student.id === student.id)).map((student) => (
                  <label key={student.id} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-warm-50">
                    <input type="checkbox" checked={selectedStudentIds.includes(student.id)} onChange={(event) => setSelectedStudentIds((current) => event.target.checked ? [...current, student.id] : current.filter((id) => id !== student.id))} className="rounded border-warm-300 text-navy-900" />
                    <span className="text-sm text-warm-800">{student.fullName}</span>
                    {student.baptismalName && <span className="text-xs text-warm-400">{student.baptismalName}</span>}
                  </label>
                ))}
                {availableStudents.filter((student) => !roster.some((item) => item.student.id === student.id)).length === 0 && <p className="px-3 py-4 text-sm text-warm-400">Không còn học sinh để thêm</p>}
              </div>
              <Button variant="primary" onClick={() => void addStudentsToClass()} disabled={selectedStudentIds.length === 0}>Thêm {selectedStudentIds.length || ""} học sinh</Button>
            </div>
            {roster.length === 0 ? (
              <p className="py-8 text-center text-sm text-warm-400">Chưa có học sinh trong lớp</p>
            ) : (
              <div className="divide-y divide-warm-100 border border-warm-200 rounded-lg">
                {roster.map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-3 py-2.5">
                    <div><p className="text-sm font-medium text-warm-900">{item.student.fullName}</p><p className="text-xs text-warm-500">{item.student.baptismalName || "-"}</p></div>
                    <button className="text-xs text-red-600 hover:text-red-800 cursor-pointer" onClick={() => void removeStudentFromClass(item.student.id)}>Xóa</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Dialog>

      <Dialog open={showAssignmentDialog} onClose={() => setShowAssignmentDialog(false)} title={assignmentClass ? `Phân công - ${assignmentClass.name}` : "Phân công giáo lý viên"}>
        <div className="space-y-4">
          <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
            <Select label="Giáo lý viên" value={selectedCatechistId} onChange={setSelectedCatechistId} placeholder="Chọn giáo lý viên" options={catechistOptions.filter((catechist) => !assignments.some((assignment) => assignment.catechist.id === catechist.id && assignment.role === assignmentRole)).map((catechist) => ({ value: catechist.id, label: `${catechist.fullName}${catechist.baptismalName ? ` - ${catechist.baptismalName}` : ""}` }))} />
            <Button variant="primary" onClick={() => void addAssignment()} disabled={!selectedCatechistId}>Phân công</Button>
          </div>
          <Select label="Vai trò" value={assignmentRole} onChange={setAssignmentRole} options={[{ value: "PRIMARY", label: "Phụ trách chính" }, { value: "ASSISTANT", label: "Trợ giảng" }]} />
          <div className="divide-y divide-warm-100 border border-warm-200 rounded-lg">
            {assignments.length === 0 ? <p className="px-3 py-5 text-sm text-warm-400 text-center">Chưa có giáo lý viên được phân công</p> : assignments.map((assignment) => <div key={assignment.id} className="flex items-center justify-between px-3 py-2.5"><div><p className="text-sm font-medium text-warm-900">{assignment.catechist.fullName}</p><p className="text-xs text-warm-500">{assignment.role === "PRIMARY" ? "Phụ trách chính" : "Trợ giảng"}</p></div><button className="text-xs text-red-600 hover:text-red-800 cursor-pointer" onClick={() => void endAssignment(assignment.id)}>Kết thúc</button></div>)}
          </div>
        </div>
      </Dialog>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
