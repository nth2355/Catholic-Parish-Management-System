import { useState } from "react";
import {
  Card, Button, SearchInput, Badge, Table, Dialog, Input, Select,
  Avatar, SectionHeader, StatCard, Dropdown, EditIcon, TrashIcon, PlusIcon,
  Toast, BookOpenIcon, UsersIcon, ProgressBar,
} from "../../components/ui";

const CLASSES = [
  { id: 1, name: "Lớp Xưng Tội 1", level: "Xưng Tội", catechist: "Chị Maria Nguyễn", students: 26, capacity: 30, attendance: 96, day: "Chủ nhật 8:00", room: "Phòng A1" },
  { id: 2, name: "Lớp Xưng Tội 2", level: "Xưng Tội", catechist: "Chưa phân công", students: 24, capacity: 30, attendance: 88, day: "Chủ nhật 9:30", room: "Phòng A2" },
  { id: 3, name: "Lớp Thêm Sức A", level: "Thêm Sức", catechist: "Anh Giuse Trần", students: 20, capacity: 25, attendance: 94, day: "Chủ nhật 8:00", room: "Phòng B1" },
  { id: 4, name: "Lớp Thêm Sức B", level: "Thêm Sức", catechist: "Chị Têrêxa Phạm", students: 22, capacity: 25, attendance: 79, day: "Thứ 7 14:00", room: "Phòng B2" },
  { id: 5, name: "Lớp Rước Lễ 1", level: "Rước Lễ", catechist: "Chị Anna Lê", students: 25, capacity: 30, attendance: 95, day: "Chủ nhật 8:00", room: "Phòng C1" },
  { id: 6, name: "Lớp Rước Lễ 2", level: "Rước Lễ", catechist: "Anh Phêrô Võ", students: 22, capacity: 30, attendance: 91, day: "Chủ nhật 9:30", room: "Phòng C2" },
  { id: 7, name: "Lớp Tìm Hiểu A", level: "Tìm Hiểu", catechist: "Anh Tôma Đặng", students: 18, capacity: 25, attendance: 85, day: "Thứ 7 14:00", room: "Hội trường" },
  { id: 8, name: "Lớp Tìm Hiểu B", level: "Tìm Hiểu", catechist: "Chị Cecilia Bùi", students: 19, capacity: 25, attendance: 89, day: "Chủ nhật 8:00", room: "Hội trường" },
];

const levelColors: Record<string, "navy" | "gold" | "success" | "default"> = {
  "Xưng Tội": "navy",
  "Thêm Sức": "gold",
  "Rước Lễ": "success",
  "Tìm Hiểu": "default",
};

export default function ClassManagement() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [view, setView] = useState<"table" | "grid">("table");

  const filtered = CLASSES.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchLevel = !levelFilter || c.level === levelFilter;
    return matchSearch && matchLevel;
  });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      <SectionHeader
        title="Quản lý lớp học"
        subtitle={`${CLASSES.length} lớp • 4 khối`}
        action={
          <Button variant="primary" onClick={() => setShowAdd(true)}>
            <PlusIcon size={14} /> Tạo lớp mới
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Tổng số lớp" value="12" icon={<BookOpenIcon size={18} />} color="navy" />
        <StatCard label="Đang hoạt động" value="12" sub="0 tạm dừng" color="green" icon={<BookOpenIcon size={18} />} />
        <StatCard label="Tổng học sinh" value="176" sub="/ 220 chỗ" color="gold" icon={<UsersIcon size={18} />} />
        <StatCard label="Lớp chưa phân công GLV" value="1" color="red" icon={<UsersIcon size={18} />} />
      </div>

      <Card>
        {/* Toolbar */}
        <div className="p-4 border-b border-warm-100 flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-44">
            <SearchInput value={search} onChange={setSearch} placeholder="Tìm lớp học..." />
          </div>
          <Select
            value={levelFilter}
            onChange={setLevelFilter}
            placeholder="Tất cả khối"
            options={[
              { value: "Xưng Tội", label: "Xưng Tội" },
              { value: "Thêm Sức", label: "Thêm Sức" },
              { value: "Rước Lễ", label: "Rước Lễ" },
              { value: "Tìm Hiểu", label: "Tìm Hiểu" },
            ]}
            className="w-36"
          />
          <div className="flex gap-1 bg-warm-100 rounded-lg p-1">
            <button
              onClick={() => setView("table")}
              className={`px-3 py-1 text-xs font-medium rounded cursor-pointer ${view === "table" ? "bg-white text-warm-900 shadow-sm" : "text-warm-500"}`}
            >
              Bảng
            </button>
            <button
              onClick={() => setView("grid")}
              className={`px-3 py-1 text-xs font-medium rounded cursor-pointer ${view === "grid" ? "bg-white text-warm-900 shadow-sm" : "text-warm-500"}`}
            >
              Lưới
            </button>
          </div>
        </div>

        {view === "table" ? (
          <Table
            headers={["Lớp học", "Khối", "Giáo lý viên", "Học sinh", "Điểm danh", "Lịch học", "Phòng", ""]}
            rows={filtered.map(c => [
              <span className="font-medium text-warm-900">{c.name}</span>,
              <Badge variant={levelColors[c.level]}>{c.level}</Badge>,
              <div className="flex items-center gap-2">
                {c.catechist !== "Chưa phân công" ? (
                  <>
                    <Avatar name={c.catechist} size="sm" />
                    <span className="text-warm-700 text-xs">{c.catechist}</span>
                  </>
                ) : (
                  <Badge variant="warning">Chưa phân công</Badge>
                )}
              </div>,
              <div className="flex items-center gap-2">
                <span className="font-medium">{c.students}</span>
                <span className="text-warm-400 text-xs">/ {c.capacity}</span>
              </div>,
              <div className="flex items-center gap-2 min-w-24">
                <div className="flex-1 h-1.5 bg-warm-100 rounded-full">
                  <div
                    className={`h-full rounded-full ${c.attendance >= 90 ? "bg-emerald-500" : c.attendance >= 80 ? "bg-navy-700" : "bg-red-400"}`}
                    style={{ width: `${c.attendance}%` }}
                  />
                </div>
                <span className="text-xs text-warm-500">{c.attendance}%</span>
              </div>,
              <span className="text-warm-500 text-xs">{c.day}</span>,
              <span className="text-warm-500 text-xs">{c.room}</span>,
              <Dropdown
                trigger={
                  <button className="text-warm-400 hover:text-warm-700 p-1 rounded cursor-pointer">
                    <span className="text-lg leading-none">···</span>
                  </button>
                }
                items={[
                  { label: "Xem danh sách lớp", onClick: () => showToast("Mở danh sách lớp...") },
                  { label: "Chỉnh sửa", icon: <EditIcon />, onClick: () => showToast("Mở form chỉnh sửa...") },
                  { label: "Xóa lớp", icon: <TrashIcon />, danger: true, onClick: () => showToast("Đã xóa lớp") },
                ]}
              />,
            ])}
          />
        ) : (
          <div className="p-4 grid grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(c => (
              <div
                key={c.id}
                className="border border-warm-200 rounded-xl p-4 hover:border-navy-200 hover:shadow-sm cursor-pointer"
                onClick={() => showToast(`Mở chi tiết ${c.name}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-warm-900 text-sm" style={{ fontFamily: "var(--font-display)" }}>{c.name}</p>
                    <Badge variant={levelColors[c.level]} className="mt-1">{c.level}</Badge>
                  </div>
                  <div className="w-9 h-9 bg-navy-50 rounded-lg flex items-center justify-center">
                    <BookOpenIcon size={16} />
                  </div>
                </div>
                <ProgressBar value={c.students} max={c.capacity} showPercent label={`${c.students}/${c.capacity} học sinh`} color="navy" />
                <div className="mt-3 flex items-center gap-2">
                  {c.catechist !== "Chưa phân công" ? (
                    <>
                      <Avatar name={c.catechist} size="sm" />
                      <span className="text-xs text-warm-500 truncate">{c.catechist}</span>
                    </>
                  ) : (
                    <Badge variant="warning">Chưa phân công GLV</Badge>
                  )}
                </div>
                <p className="text-xs text-warm-400 mt-2">{c.day} · {c.room}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Class Dialog */}
      <Dialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Tạo lớp học mới"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Hủy</Button>
            <Button variant="primary" onClick={() => { setShowAdd(false); showToast("Đã tạo lớp học thành công!"); }}>
              Tạo lớp
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Input label="Tên lớp" placeholder="Lớp Xưng Tội 1" className="col-span-2" />
          <Select
            label="Khối"
            placeholder="Chọn khối"
            options={[
              { value: "xt", label: "Xưng Tội" },
              { value: "ts", label: "Thêm Sức" },
              { value: "rl", label: "Rước Lễ" },
              { value: "th", label: "Tìm Hiểu" },
            ]}
          />
          <Input label="Sĩ số tối đa" type="number" placeholder="30" />
          <Select
            label="Giáo lý viên"
            placeholder="Chọn GLV"
            options={[
              { value: "1", label: "Chị Maria Nguyễn" },
              { value: "2", label: "Anh Giuse Trần" },
              { value: "3", label: "Chị Anna Lê" },
            ]}
          />
          <Input label="Phòng học" placeholder="Phòng A1" />
          <Select
            label="Ngày học"
            placeholder="Chọn ngày"
            options={[
              { value: "cn", label: "Chủ nhật" },
              { value: "t7", label: "Thứ 7" },
            ]}
          />
          <Input label="Giờ học" type="time" value="08:00" />
        </div>
      </Dialog>

      {toast && <Toast message={toast} type="success" onClose={() => setToast(null)} />}
    </div>
  );
}
