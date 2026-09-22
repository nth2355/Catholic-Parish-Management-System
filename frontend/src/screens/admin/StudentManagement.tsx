import { useEffect, useState } from "react";
import {
    Avatar,
    Badge,
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
    Tabs,
    Toast,
    TrashIcon,
    UsersIcon,
} from "../../components/ui";

type StudentStatus = "ACTIVE" | "INACTIVE" | "GRADUATED";
type Gender = "MALE" | "FEMALE";

type Student = {
  id: string;
  studentCode: string | null;
  fullName: string;
  baptismalName: string | null;
  dateOfBirth: string | null;
  gender: Gender;
  guardianName: string | null;
  guardianPhone: string | null;
  guardianEmail: string | null;
  address: string | null;
  status: StudentStatus;
};

type StudentForm = {
  studentCode: string;
  fullName: string;
  baptismalName: string;
  dateOfBirth: string;
  gender: Gender;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  address: string;
  status: StudentStatus;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const emptyForm: StudentForm = {
  studentCode: "",
  fullName: "",
  baptismalName: "",
  dateOfBirth: "",
  gender: "MALE",
  guardianName: "",
  guardianPhone: "",
  guardianEmail: "",
  address: "",
  status: "ACTIVE",
};

function getToken() {
  return localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
}

function formatDate(date: string | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("vi-VN").format(new Date(date));
}

function toForm(student: Student): StudentForm {
  return {
    studentCode: student.studentCode || "",
    fullName: student.fullName,
    baptismalName: student.baptismalName || "",
    dateOfBirth: student.dateOfBirth ? student.dateOfBirth.slice(0, 10) : "",
    gender: student.gender,
    guardianName: student.guardianName || "",
    guardianPhone: student.guardianPhone || "",
    guardianEmail: student.guardianEmail || "",
    address: student.address || "",
    status: student.status,
  };
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (search) params.set("search", search);
      if (tab !== "all") params.set("status", tab === "active" ? "ACTIVE" : "INACTIVE");

      const response = await fetch(`${API_BASE_URL}/students?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Không thể tải danh sách học sinh");
      setStudents(result.data);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể tải danh sách học sinh", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStudents();
  }, [search, tab]);

  const openCreateDialog = () => {
    setEditingStudent(null);
    setForm(emptyForm);
    setShowDialog(true);
  };

  const openEditDialog = (student: Student) => {
    setEditingStudent(student);
    setForm(toForm(student));
    setShowDialog(true);
  };

  const updateForm = (field: keyof StudentForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveStudent = async () => {
    if (!form.fullName.trim() || !form.baptismalName.trim() || !form.dateOfBirth) {
      showToast("Vui lòng nhập họ tên, tên thánh và ngày sinh", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        studentCode: form.studentCode || null,
        baptismalName: form.baptismalName || null,
        dateOfBirth: form.dateOfBirth || null,
        guardianName: form.guardianName || null,
        guardianPhone: form.guardianPhone || null,
        guardianEmail: form.guardianEmail || null,
        address: form.address || null,
      };
      const response = await fetch(
        `${API_BASE_URL}/students${editingStudent ? `/${editingStudent.id}` : ""}`,
        {
          method: editingStudent ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Không thể lưu học sinh");

      setShowDialog(false);
      showToast(editingStudent ? "Đã cập nhật học sinh" : "Đã thêm học sinh");
      await loadStudents();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể lưu học sinh", "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteStudent = async (student: Student) => {
    if (!window.confirm(`Xóa học sinh ${student.fullName}?`)) return;

    try {
      const response = await fetch(`${API_BASE_URL}/students/${student.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Không thể xóa học sinh");
      showToast("Đã xóa học sinh");
      await loadStudents();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể xóa học sinh", "error");
    }
  };

  const activeCount = students.filter((student) => student.status === "ACTIVE").length;
  const inactiveCount = students.filter((student) => student.status === "INACTIVE").length;

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      <SectionHeader
        title="Quản lý học sinh"
        subtitle={`${students.length} học sinh`}
        action={
          <Button variant="primary" onClick={openCreateDialog}>
            <PlusIcon size={14} /> Thêm học sinh
          </Button>
        }
      />

      <Card>
        <div className="p-4 border-b border-warm-100 flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-48">
            <SearchInput value={search} onChange={setSearch} placeholder="Tìm theo tên, tên thánh, mã..." />
          </div>
        </div>

        <div className="px-4">
          <Tabs
            tabs={[
              { id: "all", label: "Tất cả", count: students.length },
              { id: "active", label: "Đang học", count: activeCount },
              { id: "inactive", label: "Tạm nghỉ", count: inactiveCount },
            ]}
            active={tab}
            onChange={setTab}
          />
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-warm-400">Đang tải danh sách...</div>
        ) : students.length === 0 ? (
          <EmptyState
            icon={<UsersIcon size={40} />}
            title="Không tìm thấy học sinh"
            description="Thử thay đổi từ khóa hoặc thêm học sinh mới"
          />
        ) : (
          <Table
            headers={["Học sinh", "Tên thánh", "Ngày sinh", "Lớp học", "Trạng thái", ""]}
            rows={students.map((student) => [
              <div className="flex items-center gap-3" key={student.id}>
                <Avatar name={student.fullName} size="sm" />
                <div>
                  <span className="font-medium text-warm-900">{student.fullName}</span>
                  {student.studentCode && <p className="text-xs text-warm-400">{student.studentCode}</p>}
                </div>
              </div>,
              <span className="text-warm-500">{student.baptismalName || "-"}</span>,
              <span className="text-warm-500 text-xs">{formatDate(student.dateOfBirth)}</span>,
              <span className="text-warm-400">-</span>,
              <Badge variant={student.status === "ACTIVE" ? "success" : student.status === "GRADUATED" ? "navy" : "warning"}>
                {student.status === "ACTIVE" ? "Đang học" : student.status === "GRADUATED" ? "Đã tốt nghiệp" : "Tạm nghỉ"}
              </Badge>,
              <Dropdown
                trigger={<button className="text-warm-400 hover:text-warm-700 p-1 rounded cursor-pointer"><span className="text-lg leading-none">···</span></button>}
                items={[
                  { label: "Chỉnh sửa", icon: <EditIcon />, onClick: () => openEditDialog(student) },
                  { label: "Xóa học sinh", icon: <TrashIcon />, onClick: () => void deleteStudent(student), danger: true },
                ]}
              />,
            ])}
          />
        )}

        <div className="px-4 py-3 border-t border-warm-100">
          <p className="text-xs text-warm-400">Hiển thị {students.length} học sinh</p>
        </div>
      </Card>

      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        title={editingStudent ? "Chỉnh sửa học sinh" : "Thêm học sinh mới"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDialog(false)}>Hủy</Button>
            <Button variant="primary" onClick={() => void saveStudent()} disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu học sinh"}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Input label="Họ và tên" required value={form.fullName} onChange={(value) => updateForm("fullName", value)} className="col-span-2" />
          <Input label="Mã học sinh (tùy chọn)" value={form.studentCode} onChange={(value) => updateForm("studentCode", value)} />
          <Input label="Tên thánh" required value={form.baptismalName} onChange={(value) => updateForm("baptismalName", value)} />
          <Input label="Ngày sinh" required type="date" value={form.dateOfBirth} onChange={(value) => updateForm("dateOfBirth", value)} />
          <Select label="Giới tính" required value={form.gender} onChange={(value) => updateForm("gender", value)} options={[{ value: "MALE", label: "Nam" }, { value: "FEMALE", label: "Nữ" }]} />
          <Input label="Tên phụ huynh (tùy chọn)" value={form.guardianName} onChange={(value) => updateForm("guardianName", value)} />
          <Input label="Số điện thoại phụ huynh (tùy chọn)" value={form.guardianPhone} onChange={(value) => updateForm("guardianPhone", value)} />
          <Input label="Email phụ huynh (tùy chọn)" value={form.guardianEmail} onChange={(value) => updateForm("guardianEmail", value)} />
          <Select label="Trạng thái" value={form.status} onChange={(value) => updateForm("status", value)} options={[{ value: "ACTIVE", label: "Đang học" }, { value: "INACTIVE", label: "Tạm nghỉ" }, { value: "GRADUATED", label: "Đã tốt nghiệp" }]} />
          <Input label="Địa chỉ (tùy chọn)" value={form.address} onChange={(value) => updateForm("address", value)} className="col-span-2" />
        </div>
      </Dialog>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
