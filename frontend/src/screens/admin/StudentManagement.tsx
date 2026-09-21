import { useState } from "react";
import {
  Card, Button, SearchInput, Badge, Table, Dialog, Input, Select,
  Tabs, Avatar, SectionHeader, Dropdown, EditIcon, TrashIcon, PlusIcon,
  Toast, UsersIcon, EmptyState,
} from "../../components/ui";

const STUDENTS = [
  { id: 1, name: "Nguyễn Thị Bảo Châu", baptism: "Maria", dob: "12/03/2014", class: "Lớp Xưng Tội 1", status: "active", attendance: 96 },
  { id: 2, name: "Trần Minh Khôi", baptism: "Giuse", dob: "05/07/2013", class: "Lớp Thêm Sức A", status: "active", attendance: 88 },
  { id: 3, name: "Lê Thị Hương Giang", baptism: "Anna", dob: "22/11/2014", class: "Lớp Xưng Tội 1", status: "active", attendance: 100 },
  { id: 4, name: "Phạm Quốc Hùng", baptism: "Phêrô", dob: "08/04/2013", class: "Lớp Thêm Sức B", status: "inactive", attendance: 62 },
  { id: 5, name: "Võ Thị Mỹ Linh", baptism: "Têrêxa", dob: "19/09/2015", class: "Lớp Rước Lễ 1", status: "active", attendance: 92 },
  { id: 6, name: "Đặng Văn Tùng", baptism: "Augustinô", dob: "03/01/2014", class: "Lớp Xưng Tội 2", status: "active", attendance: 85 },
  { id: 7, name: "Ngô Thị Lan Anh", baptism: "Cecilia", dob: "14/06/2015", class: "Lớp Rước Lễ 2", status: "active", attendance: 94 },
  { id: 8, name: "Bùi Thanh Long", baptism: "Micae", dob: "27/02/2013", class: "Lớp Thêm Sức A", status: "active", attendance: 78 },
];

export default function StudentManagement() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [classFilter, setClassFilter] = useState("");

  const filtered = STUDENTS.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.baptism.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === "all" || (tab === "active" ? s.status === "active" : s.status === "inactive");
    const matchClass = !classFilter || s.class === classFilter;
    return matchSearch && matchTab && matchClass;
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      <SectionHeader
        title="Quản lý học sinh"
        subtitle={`${STUDENTS.length} học sinh • Năm học 2024–2025`}
        action={
          <Button variant="primary" onClick={() => setShowAdd(true)}>
            <PlusIcon size={14} /> Thêm học sinh
          </Button>
        }
      />

      <Card>
        {/* Filters */}
        <div className="p-4 border-b border-warm-100 flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-48">
            <SearchInput value={search} onChange={setSearch} placeholder="Tìm theo tên, tên thánh..." />
          </div>
          <Select
            value={classFilter}
            onChange={setClassFilter}
            placeholder="Tất cả lớp"
            options={[
              { value: "Lớp Xưng Tội 1", label: "Lớp Xưng Tội 1" },
              { value: "Lớp Xưng Tội 2", label: "Lớp Xưng Tội 2" },
              { value: "Lớp Thêm Sức A", label: "Lớp Thêm Sức A" },
              { value: "Lớp Thêm Sức B", label: "Lớp Thêm Sức B" },
              { value: "Lớp Rước Lễ 1", label: "Lớp Rước Lễ 1" },
              { value: "Lớp Rước Lễ 2", label: "Lớp Rước Lễ 2" },
            ]}
            className="w-44"
          />
          {classFilter && (
            <button
              onClick={() => setClassFilter("")}
              className="text-xs text-warm-500 hover:text-warm-800 cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="px-4">
          <Tabs
            tabs={[
              { id: "all", label: "Tất cả", count: STUDENTS.length },
              { id: "active", label: "Đang học", count: STUDENTS.filter(s => s.status === "active").length },
              { id: "inactive", label: "Tạm nghỉ", count: STUDENTS.filter(s => s.status === "inactive").length },
            ]}
            active={tab}
            onChange={setTab}
          />
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<UsersIcon size={40} />}
            title="Không tìm thấy học sinh"
            description="Thử thay đổi từ khóa hoặc bộ lọc"
          />
        ) : (
          <Table
            headers={["Học sinh", "Tên thánh", "Ngày sinh", "Lớp học", "Điểm danh", "Trạng thái", ""]}
            rows={filtered.map(s => [
              <div className="flex items-center gap-3">
                <Avatar name={s.name} size="sm" />
                <span className="font-medium text-warm-900">{s.name}</span>
              </div>,
              <span className="text-warm-500">{s.baptism}</span>,
              <span className="text-warm-500 text-xs">{s.dob}</span>,
              <span className="text-warm-700">{s.class}</span>,
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-warm-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.attendance >= 90 ? "bg-emerald-500" : s.attendance >= 75 ? "bg-navy-700" : "bg-red-400"}`}
                    style={{ width: `${s.attendance}%` }}
                  />
                </div>
                <span className="text-xs text-warm-500">{s.attendance}%</span>
              </div>,
              <Badge variant={s.status === "active" ? "success" : "warning"}>
                {s.status === "active" ? "Đang học" : "Tạm nghỉ"}
              </Badge>,
              <Dropdown
                trigger={
                  <button className="text-warm-400 hover:text-warm-700 p-1 rounded cursor-pointer">
                    <span className="text-lg leading-none">···</span>
                  </button>
                }
                items={[
                  { label: "Chỉnh sửa", icon: <EditIcon />, onClick: () => showToast("Đang mở form chỉnh sửa...") },
                  { label: "Xem hồ sơ", onClick: () => showToast("Đang mở hồ sơ học sinh...") },
                  { label: "Xóa học sinh", icon: <TrashIcon />, onClick: () => showToast("Đã xóa học sinh"), danger: true },
                ]}
              />,
            ])}
          />
        )}

        {/* Footer */}
        <div className="px-4 py-3 border-t border-warm-100 flex items-center justify-between">
          <p className="text-xs text-warm-400">Hiển thị {filtered.length} / {STUDENTS.length} học sinh</p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">← Trước</Button>
            <Button variant="secondary" size="sm">Tiếp →</Button>
          </div>
        </div>
      </Card>

      {/* Add Student Dialog */}
      <Dialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Thêm học sinh mới"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Hủy</Button>
            <Button variant="primary" onClick={() => { setShowAdd(false); showToast("Đã thêm học sinh thành công!"); }}>
              Lưu học sinh
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Input label="Họ và tên" placeholder="Nguyễn Thị Bảo Châu" className="col-span-2" />
          <Input label="Tên thánh" placeholder="Maria" />
          <Input label="Ngày sinh" type="date" />
          <Select
            label="Lớp học"
            placeholder="Chọn lớp"
            options={[
              { value: "xt1", label: "Lớp Xưng Tội 1" },
              { value: "xt2", label: "Lớp Xưng Tội 2" },
              { value: "tsa", label: "Lớp Thêm Sức A" },
              { value: "tsb", label: "Lớp Thêm Sức B" },
            ]}
          />
          <Select
            label="Trạng thái"
            placeholder="Chọn"
            options={[
              { value: "active", label: "Đang học" },
              { value: "inactive", label: "Tạm nghỉ" },
            ]}
          />
          <Input label="Số điện thoại phụ huynh" placeholder="0901 234 567" className="col-span-2" />
          <Input label="Email phụ huynh" placeholder="phu.huynh@email.com" className="col-span-2" />
        </div>
      </Dialog>

      {toast && <Toast message={toast} type="success" onClose={() => setToast(null)} />}
    </div>
  );
}
