import { useState } from "react";
import {
  Card, Button, Badge, Table, Dialog, Input, Select,
  SectionHeader, Dropdown, EditIcon, PlusIcon, Toast, CalendarIcon,
  CheckCircleIcon, SearchInput, StatCard,
} from "../../components/ui";

const SESSIONS = [
  { id: 1, class: "Lớp Xưng Tội 1", topic: "Bí Tích Xưng Tội – Bài 3", catechist: "Chị Maria Nguyễn", date: "08/09/2024", time: "08:00–09:30", room: "Phòng A1", present: 24, total: 26, status: "done" },
  { id: 2, class: "Lớp Thêm Sức A", topic: "Chúa Thánh Thần – Hoa Trái", catechist: "Anh Giuse Trần", date: "08/09/2024", time: "08:00–09:30", room: "Phòng B1", present: 18, total: 20, status: "done" },
  { id: 3, class: "Lớp Rước Lễ 1", topic: "Bí Tích Thánh Thể – Bài 5", catechist: "Chị Anna Lê", date: "08/09/2024", time: "09:30–11:00", room: "Phòng C1", present: 0, total: 25, status: "in-progress" },
  { id: 4, class: "Lớp Rước Lễ 2", topic: "Kinh Nguyện và Cầu Nguyện", catechist: "Anh Phêrô Võ", date: "14/09/2024", time: "09:30–11:00", room: "Phòng C2", present: 0, total: 22, status: "upcoming" },
  { id: 5, class: "Lớp Xưng Tội 2", topic: "Tội Lỗi và Tha Thứ", catechist: "Chưa phân công", date: "15/09/2024", time: "08:00–09:30", room: "Phòng A2", present: 0, total: 24, status: "upcoming" },
  { id: 6, class: "Lớp Thêm Sức B", topic: "Bí Tích Thêm Sức – Bài 1", catechist: "Chị Têrêxa Phạm", date: "14/09/2024", time: "14:00–15:30", room: "Phòng B2", present: 0, total: 22, status: "upcoming" },
];

const statusConfig: Record<string, { label: string; variant: "success" | "navy" | "muted" | "warning" }> = {
  done: { label: "Hoàn thành", variant: "success" },
  "in-progress": { label: "Đang diễn ra", variant: "navy" },
  upcoming: { label: "Sắp tới", variant: "muted" },
};

export default function SessionManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "week">("list");

  const filtered = SESSIONS.filter(s => {
    const matchSearch = s.class.toLowerCase().includes(search.toLowerCase()) ||
      s.topic.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      <SectionHeader
        title="Quản lý buổi học"
        subtitle="Lịch học tháng 9/2024"
        action={
          <Button variant="primary" onClick={() => setShowAdd(true)}>
            <PlusIcon size={14} /> Tạo buổi học
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Tổng buổi học" value={SESSIONS.length} icon={<CalendarIcon size={18} />} color="navy" />
        <StatCard label="Hoàn thành" value={SESSIONS.filter(s => s.status === "done").length} color="green" icon={<CheckCircleIcon size={18} />} />
        <StatCard label="Sắp diễn ra" value={SESSIONS.filter(s => s.status === "upcoming").length} color="gold" icon={<CalendarIcon size={18} />} />
        <StatCard label="Chưa điểm danh" value="1" color="red" icon={<CalendarIcon size={18} />} />
      </div>

      <Card>
        <div className="p-4 border-b border-warm-100 flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-44">
            <SearchInput value={search} onChange={setSearch} placeholder="Tìm lớp, chủ đề..." />
          </div>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Tất cả trạng thái"
            options={[
              { value: "done", label: "Hoàn thành" },
              { value: "in-progress", label: "Đang diễn ra" },
              { value: "upcoming", label: "Sắp tới" },
            ]}
            className="w-44"
          />
          <div className="flex gap-1 bg-warm-100 rounded-lg p-1">
            <button onClick={() => setViewMode("list")} className={`px-3 py-1 text-xs font-medium rounded cursor-pointer ${viewMode === "list" ? "bg-white text-warm-900 shadow-sm" : "text-warm-500"}`}>
              Danh sách
            </button>
            <button onClick={() => setViewMode("week")} className={`px-3 py-1 text-xs font-medium rounded cursor-pointer ${viewMode === "week" ? "bg-white text-warm-900 shadow-sm" : "text-warm-500"}`}>
              Lịch tuần
            </button>
          </div>
        </div>

        {viewMode === "list" ? (
          <Table
            headers={["Lớp học", "Chủ đề bài giảng", "Giáo lý viên", "Ngày", "Giờ", "Phòng", "Điểm danh", "Trạng thái", ""]}
            rows={filtered.map(s => [
              <span className="font-medium text-warm-900">{s.class}</span>,
              <span className="text-warm-600 max-w-48 block truncate">{s.topic}</span>,
              s.catechist === "Chưa phân công"
                ? <Badge variant="warning">Chưa phân công</Badge>
                : <span className="text-warm-500 text-sm">{s.catechist}</span>,
              <span className="text-warm-500 text-sm">{s.date}</span>,
              <span className="text-warm-500 text-sm">{s.time}</span>,
              <span className="text-warm-500 text-sm">{s.room}</span>,
              s.status === "done"
                ? <span className="text-emerald-700 font-medium text-sm">{s.present}/{s.total}</span>
                : <span className="text-warm-300 text-sm">—/{s.total}</span>,
              <Badge variant={statusConfig[s.status].variant}>{statusConfig[s.status].label}</Badge>,
              <Dropdown
                trigger={
                  <button className="text-warm-400 hover:text-warm-700 p-1 rounded cursor-pointer">
                    <span className="text-lg leading-none">···</span>
                  </button>
                }
                items={[
                  { label: "Điểm danh", icon: <CheckCircleIcon size={14} />, onClick: () => showToast("Mở điểm danh...") },
                  { label: "Chỉnh sửa", icon: <EditIcon />, onClick: () => showToast("Mở chỉnh sửa...") },
                  { label: "Xóa", danger: true, onClick: () => showToast("Đã xóa buổi học") },
                ]}
              />,
            ])}
          />
        ) : (
          /* Week calendar view */
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map(d => (
                <div key={d} className="text-center text-xs font-semibold text-warm-500 py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }, (_, i) => {
                const dayNum = i + 9;
                const daySessions = SESSIONS.filter(() => i === 5 || i === 6);
                return (
                  <div key={i} className={`min-h-24 rounded-lg border p-1.5 ${i >= 5 ? "border-navy-100 bg-navy-50/30" : "border-warm-100"}`}>
                    <p className={`text-xs font-medium mb-1 ${i >= 5 ? "text-navy-700" : "text-warm-500"}`}>{dayNum}</p>
                    {i === 6 && SESSIONS.slice(0, 3).map((s, si) => (
                      <div key={si} className="bg-navy-900 text-white text-xs rounded px-1 py-0.5 mb-1 truncate cursor-pointer hover:bg-navy-800">
                        {s.class}
                      </div>
                    ))}
                    {i === 5 && SESSIONS.slice(5, 6).map((s, si) => (
                      <div key={si} className="bg-gold-500 text-white text-xs rounded px-1 py-0.5 mb-1 truncate cursor-pointer hover:bg-gold-600">
                        {s.class}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      <Dialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Tạo buổi học mới"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Hủy</Button>
            <Button variant="primary" onClick={() => { setShowAdd(false); showToast("Đã tạo buổi học!"); }}>Tạo</Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Lớp học"
            placeholder="Chọn lớp"
            options={SESSIONS.map(s => ({ value: s.id.toString(), label: s.class }))}
            className="col-span-2"
          />
          <Input label="Chủ đề bài giảng" placeholder="Bí Tích Xưng Tội – Bài 1" className="col-span-2" />
          <Input label="Ngày học" type="date" />
          <Input label="Giờ bắt đầu" type="time" />
          <Input label="Giờ kết thúc" type="time" />
          <Input label="Phòng học" placeholder="Phòng A1" />
        </div>
      </Dialog>

      {toast && <Toast message={toast} type="success" onClose={() => setToast(null)} />}
    </div>
  );
}
