import { useState } from "react";
import {
  Card, Button, SearchInput, Badge, Table, Dialog, Input, Select,
  Avatar, SectionHeader, StatCard, Dropdown, EditIcon, TrashIcon, PlusIcon,
  Toast, UsersIcon, AwardIcon, ProgressBar,
} from "../../components/ui";

const CATECHISTS = [
  { id: 1, name: "Chị Maria Nguyễn Thị Hoa", baptism: "Maria", phone: "0901 234 567", classes: ["Lớp Xưng Tội 1"], years: 5, status: "active", attendance: 98 },
  { id: 2, name: "Anh Giuse Trần Văn Minh", baptism: "Giuse", phone: "0912 345 678", classes: ["Lớp Thêm Sức A"], years: 3, status: "active", attendance: 95 },
  { id: 3, name: "Chị Anna Lê Thị Phương", baptism: "Anna", phone: "0923 456 789", classes: ["Lớp Rước Lễ 1"], years: 7, status: "active", attendance: 100 },
  { id: 4, name: "Anh Phêrô Võ Quốc Bảo", baptism: "Phêrô", phone: "0934 567 890", classes: ["Lớp Rước Lễ 2"], years: 4, status: "active", attendance: 96 },
  { id: 5, name: "Chị Têrêxa Phạm Thị Lan", baptism: "Têrêxa", phone: "0945 678 901", classes: ["Lớp Thêm Sức B"], years: 2, status: "active", attendance: 92 },
  { id: 6, name: "Anh Tôma Đặng Thanh Tú", baptism: "Tôma", phone: "0956 789 012", classes: ["Lớp Tìm Hiểu A"], years: 6, status: "active", attendance: 94 },
  { id: 7, name: "Chị Cecilia Bùi Thị Ngọc", baptism: "Cecilia", phone: "0967 890 123", classes: ["Lớp Tìm Hiểu B"], years: 1, status: "probation", attendance: 88 },
  { id: 8, name: "Anh Stêphanô Ngô Văn Đức", baptism: "Stêphanô", phone: "0978 901 234", classes: [], years: 0, status: "new", attendance: 0 },
];

export default function CatechistManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = CATECHISTS.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const statusVariant = (s: string) => {
    if (s === "active") return "success";
    if (s === "probation") return "warning";
    return "muted";
  };
  const statusLabel = (s: string) => {
    if (s === "active") return "Chính thức";
    if (s === "probation") return "Tập sự";
    return "Mới";
  };

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      <SectionHeader
        title="Quản lý giáo lý viên"
        subtitle={`${CATECHISTS.length} giáo lý viên`}
        action={
          <Button variant="primary" onClick={() => setShowAdd(true)}>
            <PlusIcon size={14} /> Thêm GLV
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Tổng GLV" value={CATECHISTS.length} icon={<UsersIcon size={18} />} color="navy" />
        <StatCard label="Chính thức" value={CATECHISTS.filter(c => c.status === "active").length} color="green" icon={<AwardIcon size={18} />} />
        <StatCard label="Tập sự" value={CATECHISTS.filter(c => c.status === "probation").length} color="gold" icon={<UsersIcon size={18} />} />
        <StatCard label="Chưa phân công" value={CATECHISTS.filter(c => c.classes.length === 0).length} color="red" icon={<UsersIcon size={18} />} />
      </div>

      <Card>
        <div className="p-4 border-b border-warm-100 flex gap-3 items-center">
          <div className="flex-1">
            <SearchInput value={search} onChange={setSearch} placeholder="Tìm giáo lý viên..." />
          </div>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Tất cả"
            options={[
              { value: "active", label: "Chính thức" },
              { value: "probation", label: "Tập sự" },
              { value: "new", label: "Mới" },
            ]}
            className="w-36"
          />
        </div>

        <Table
          headers={["Giáo lý viên", "Tên thánh", "Số điện thoại", "Lớp phụ trách", "Năm phục vụ", "Chuyên cần", "Trạng thái", ""]}
          rows={filtered.map(c => [
            <div className="flex items-center gap-3">
              <Avatar name={c.name} size="md" />
              <div>
                <p className="font-medium text-warm-900 text-sm">{c.name}</p>
              </div>
            </div>,
            <span className="text-warm-500 text-sm">{c.baptism}</span>,
            <span className="text-warm-500 text-sm">{c.phone}</span>,
            <div className="flex flex-col gap-0.5">
              {c.classes.length > 0 ? c.classes.map((cls, i) => (
                <Badge key={i} variant="navy" className="text-xs">{cls}</Badge>
              )) : <Badge variant="warning">Chưa phân công</Badge>}
            </div>,
            <span className="text-warm-700 font-medium">{c.years > 0 ? `${c.years} năm` : "—"}</span>,
            c.attendance > 0 ? (
              <div className="flex items-center gap-2 min-w-24">
                <div className="flex-1 h-1.5 bg-warm-100 rounded-full">
                  <div
                    className={`h-full rounded-full ${c.attendance >= 95 ? "bg-emerald-500" : "bg-navy-700"}`}
                    style={{ width: `${c.attendance}%` }}
                  />
                </div>
                <span className="text-xs text-warm-500">{c.attendance}%</span>
              </div>
            ) : <span className="text-warm-300 text-sm">—</span>,
            <Badge variant={statusVariant(c.status)}>{statusLabel(c.status)}</Badge>,
            <Dropdown
              trigger={
                <button className="text-warm-400 hover:text-warm-700 p-1 rounded cursor-pointer">
                  <span className="text-lg leading-none">···</span>
                </button>
              }
              items={[
                { label: "Xem hồ sơ", onClick: () => showToast("Mở hồ sơ GLV...") },
                { label: "Phân công lớp", onClick: () => showToast("Mở phân công...") },
                { label: "Chỉnh sửa", icon: <EditIcon />, onClick: () => showToast("Mở form chỉnh sửa...") },
                { label: "Xóa", icon: <TrashIcon />, danger: true, onClick: () => showToast("Đã xóa GLV") },
              ]}
            />,
          ])}
        />
      </Card>

      {/* Profile cards */}
      <div>
        <h3 className="text-sm font-semibold text-warm-700 mb-3" style={{ fontFamily: "var(--font-display)" }}>
          Hiệu suất tháng này
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {CATECHISTS.filter(c => c.attendance > 0).slice(0, 4).map(c => (
            <div key={c.id} className="bg-white border border-warm-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={c.name} size="md" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-warm-900 truncate">{c.name.split(" ").slice(-2).join(" ")}</p>
                  <p className="text-xs text-warm-400">{c.classes[0] || "—"}</p>
                </div>
              </div>
              <ProgressBar value={c.attendance} showPercent label="Chuyên cần" color={c.attendance >= 95 ? "green" : "navy"} />
            </div>
          ))}
        </div>
      </div>

      <Dialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Thêm giáo lý viên"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Hủy</Button>
            <Button variant="primary" onClick={() => { setShowAdd(false); showToast("Đã thêm GLV thành công!"); }}>
              Lưu
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Input label="Họ và tên" placeholder="Chị Maria Nguyễn" className="col-span-2" />
          <Input label="Tên thánh" placeholder="Maria" />
          <Input label="Năm sinh" type="number" placeholder="1995" />
          <Input label="Số điện thoại" placeholder="0901 234 567" />
          <Input label="Email" type="email" placeholder="email@example.com" />
          <Select
            label="Trạng thái"
            placeholder="Chọn"
            options={[
              { value: "active", label: "Chính thức" },
              { value: "probation", label: "Tập sự" },
              { value: "new", label: "Mới" },
            ]}
          />
          <Select
            label="Phân công lớp"
            placeholder="Chọn lớp (tuỳ chọn)"
            options={[
              { value: "xt1", label: "Lớp Xưng Tội 1" },
              { value: "tsa", label: "Lớp Thêm Sức A" },
            ]}
          />
        </div>
      </Dialog>

      {toast && <Toast message={toast} type="success" onClose={() => setToast(null)} />}
    </div>
  );
}
