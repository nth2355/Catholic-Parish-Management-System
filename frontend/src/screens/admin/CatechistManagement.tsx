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
    Toast,
    TrashIcon,
    UsersIcon,
} from "../../components/ui";

type CatechistStatus = "NEW" | "PROBATION" | "ACTIVE" | "INACTIVE";
type Catechist = {
  id: string;
  fullName: string;
  baptismalName: string | null;
  dateOfBirth: string | null;
  phone: string | null;
  email: string | null;
  joinedAt: string | null;
  status: CatechistStatus;
  assignments: { class: { id: string; name: string } }[];
};

type Form = {
  fullName: string;
  baptismalName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  joinedAt: string;
  status: CatechistStatus;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const emptyForm: Form = { fullName: "", baptismalName: "", dateOfBirth: "", phone: "", email: "", joinedAt: "", status: "NEW" };
const statusLabels: Record<CatechistStatus, string> = { NEW: "Mới", PROBATION: "Tập sự", ACTIVE: "Chính thức", INACTIVE: "Ngừng hoạt động" };

function getToken() {
  return localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
}

function formatDate(value: string | null) {
  return value ? new Intl.DateTimeFormat("vi-VN").format(new Date(value)) : "-";
}

function toForm(catechist: Catechist): Form {
  return {
    fullName: catechist.fullName,
    baptismalName: catechist.baptismalName || "",
    dateOfBirth: catechist.dateOfBirth?.slice(0, 10) || "",
    phone: catechist.phone || "",
    email: catechist.email || "",
    joinedAt: catechist.joinedAt?.slice(0, 10) || "",
    status: catechist.status,
  };
}

export default function CatechistManagement() {
  const [catechists, setCatechists] = useState<Catechist[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Catechist | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
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
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...options.headers },
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Không thể thực hiện thao tác");
    return result;
  };

  const loadCatechists = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const result = await request(`/catechists?${params}`);
      setCatechists(result.data);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể tải giáo lý viên", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadCatechists(); }, [search, statusFilter]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowDialog(true); };
  const openEdit = (catechist: Catechist) => { setEditing(catechist); setForm(toForm(catechist)); setShowDialog(true); };
  const updateForm = (field: keyof Form, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const saveCatechist = async () => {
    if (!form.fullName.trim()) { showToast("Vui lòng nhập họ và tên", "error"); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        baptismalName: form.baptismalName || null,
        dateOfBirth: form.dateOfBirth || null,
        phone: form.phone || null,
        email: form.email || null,
        joinedAt: form.joinedAt || null,
      };
      await request(`/catechists${editing ? `/${editing.id}` : ""}`, { method: editing ? "PATCH" : "POST", body: JSON.stringify(payload) });
      setShowDialog(false);
      showToast(editing ? "Đã cập nhật giáo lý viên" : "Đã thêm giáo lý viên");
      await loadCatechists();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể lưu giáo lý viên", "error");
    } finally { setSaving(false); }
  };

  const deleteCatechist = async (catechist: Catechist) => {
    if (!window.confirm(`Xóa giáo lý viên ${catechist.fullName}?`)) return;
    try {
      await request(`/catechists/${catechist.id}`, { method: "DELETE" });
      showToast("Đã xóa giáo lý viên");
      await loadCatechists();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể xóa giáo lý viên", "error");
    }
  };

  const activeCount = catechists.filter((catechist) => catechist.status === "ACTIVE").length;
  const assignedCount = catechists.filter((catechist) => catechist.assignments.length > 0).length;

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      <SectionHeader title="Quản lý giáo lý viên" subtitle={`${catechists.length} giáo lý viên`} action={<Button variant="primary" onClick={openCreate}><PlusIcon size={14} /> Thêm GLV</Button>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4"><p className="text-xs text-warm-500">Tổng GLV</p><p className="text-2xl font-bold text-navy-900 mt-1">{catechists.length}</p></Card>
        <Card className="p-4"><p className="text-xs text-warm-500">Chính thức</p><p className="text-2xl font-bold text-emerald-700 mt-1">{activeCount}</p></Card>
        <Card className="p-4"><p className="text-xs text-warm-500">Tập sự</p><p className="text-2xl font-bold text-gold-600 mt-1">{catechists.filter((c) => c.status === "PROBATION").length}</p></Card>
        <Card className="p-4"><p className="text-xs text-warm-500">Đã phân công</p><p className="text-2xl font-bold text-navy-700 mt-1">{assignedCount}</p></Card>
      </div>

      <Card>
        <div className="p-4 border-b border-warm-100 flex gap-3 items-center">
          <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Tìm giáo lý viên..." /></div>
          <Select value={statusFilter} onChange={setStatusFilter} placeholder="Tất cả" options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))} className="w-44" />
        </div>
        {loading ? <div className="py-16 text-center text-sm text-warm-400">Đang tải danh sách...</div> : catechists.length === 0 ? <EmptyState icon={<UsersIcon size={40} />} title="Chưa có giáo lý viên" description="Thêm giáo lý viên đầu tiên để bắt đầu phân công lớp" /> : (
          <Table headers={["Giáo lý viên", "Tên thánh", "Liên hệ", "Lớp phụ trách", "Ngày tham gia", "Trạng thái", ""]} rows={catechists.map((catechist) => [
            <div className="flex items-center gap-3"><Avatar name={catechist.fullName} size="md" /><span className="font-medium text-warm-900 text-sm">{catechist.fullName}</span></div>,
            <span className="text-warm-500 text-sm">{catechist.baptismalName || "-"}</span>,
            <div className="text-xs text-warm-500"><p>{catechist.phone || "-"}</p><p>{catechist.email || ""}</p></div>,
            <div className="flex flex-col gap-1">{catechist.assignments.length ? catechist.assignments.map((assignment) => <Badge key={assignment.class.id} variant="navy">{assignment.class.name}</Badge>) : <Badge variant="warning">Chưa phân công</Badge>}</div>,
            <span className="text-xs text-warm-500">{formatDate(catechist.joinedAt)}</span>,
            <Badge variant={catechist.status === "ACTIVE" ? "success" : catechist.status === "PROBATION" ? "warning" : "muted"}>{statusLabels[catechist.status]}</Badge>,
            <Dropdown dropUp trigger={<button className="text-warm-400 hover:text-warm-700 p-1 rounded cursor-pointer"><span className="text-lg leading-none">···</span></button>} items={[{ label: "Chỉnh sửa", icon: <EditIcon />, onClick: () => openEdit(catechist) }, { label: "Xóa", icon: <TrashIcon />, danger: true, onClick: () => void deleteCatechist(catechist) }]} />,
          ])} />
        )}
        <div className="px-4 py-3 border-t border-warm-100"><p className="text-xs text-warm-400">Hiển thị {catechists.length} giáo lý viên</p></div>
      </Card>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title={editing ? "Chỉnh sửa giáo lý viên" : "Thêm giáo lý viên"} footer={<><Button variant="secondary" onClick={() => setShowDialog(false)}>Hủy</Button><Button variant="primary" onClick={() => void saveCatechist()} disabled={saving}>{saving ? "Đang lưu..." : "Lưu"}</Button></>}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Họ và tên" value={form.fullName} onChange={(value) => updateForm("fullName", value)} className="col-span-2" />
          <Input label="Tên thánh (tùy chọn)" value={form.baptismalName} onChange={(value) => updateForm("baptismalName", value)} />
          <Input label="Ngày sinh (tùy chọn)" type="date" value={form.dateOfBirth} onChange={(value) => updateForm("dateOfBirth", value)} />
          <Input label="Số điện thoại (tùy chọn)" value={form.phone} onChange={(value) => updateForm("phone", value)} />
          <Input label="Email (tùy chọn)" type="email" value={form.email} onChange={(value) => updateForm("email", value)} />
          <Input label="Ngày tham gia (tùy chọn)" type="date" value={form.joinedAt} onChange={(value) => updateForm("joinedAt", value)} />
          <Select label="Trạng thái" value={form.status} onChange={(value) => updateForm("status", value)} options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))} />
        </div>
      </Dialog>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
