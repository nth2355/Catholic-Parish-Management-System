import { Badge, Button, ProgressBar, LogOutIcon, BellIcon, ChevronRightIcon } from "../../components/ui";

export default function CatechistProfile({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="pb-8">
      {/* Header */}
      <div className="bg-navy-950 px-4 pt-12 pb-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-gold-500/20 rounded-full flex items-center justify-center mb-3">
            <span className="text-white text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>MN</span>
          </div>
          <h1 className="text-white text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Chị Maria Nguyễn Thị Hoa
          </h1>
          <p className="text-white/50 text-sm mt-0.5">Giáo lý viên · 5 năm phục vụ</p>
          <Badge variant="gold" className="mt-2">Chính thức</Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl border border-warm-200 shadow-sm p-4 grid grid-cols-3 gap-4">
          {[
            { label: "Lớp phụ trách", value: "1" },
            { label: "Buổi đã dạy", value: "24" },
            { label: "Chuyên cần", value: "98%" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-xl font-bold text-navy-900" style={{ fontFamily: "var(--font-display)" }}>{s.value}</p>
              <p className="text-xs text-warm-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Class info */}
      <div className="px-4 mt-5">
        <h2 className="text-sm font-bold text-warm-900 mb-3" style={{ fontFamily: "var(--font-display)" }}>
          Lớp đang phụ trách
        </h2>
        <div className="bg-white rounded-2xl border border-warm-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-warm-900">Lớp Xưng Tội 1</p>
              <p className="text-sm text-warm-400">Chủ nhật 08:00 · Phòng A1</p>
            </div>
            <Badge variant="success">Đang hoạt động</Badge>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-warm-500 mb-1">26/30 học sinh</p>
              <ProgressBar value={26} max={30} color="navy" />
            </div>
            <div>
              <p className="text-xs text-warm-500 mb-1">Điểm danh 96%</p>
              <ProgressBar value={96} color="green" />
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="px-4 mt-5">
        <h2 className="text-sm font-bold text-warm-900 mb-3" style={{ fontFamily: "var(--font-display)" }}>
          Cài đặt
        </h2>
        <div className="bg-white rounded-2xl border border-warm-200 divide-y divide-warm-100">
          {[
            { label: "Thông báo", icon: <BellIcon size={18} />, badge: "3" },
            { label: "Thông tin cá nhân", icon: null },
            { label: "Đổi mật khẩu", icon: null },
            { label: "Ngôn ngữ", icon: null, value: "Tiếng Việt" },
            { label: "Về ứng dụng", icon: null, value: "v1.0.0" },
          ].map((item, i) => (
            <button key={i} className="w-full flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-warm-50 text-left">
              {item.icon && <span className="text-warm-400">{item.icon}</span>}
              <span className="flex-1 text-sm text-warm-800">{item.label}</span>
              {item.badge && (
                <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{item.badge}</span>
              )}
              {item.value && <span className="text-xs text-warm-400">{item.value}</span>}
              <ChevronRightIcon size={14} />
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="px-4 mt-4">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-200 text-red-600 bg-red-50 text-sm font-medium cursor-pointer hover:bg-red-100"
        >
          <LogOutIcon size={16} />
          Đăng xuất
        </button>
      </div>

      {/* Footer */}
      <div className="text-center mt-6">
        <div className="inline-flex items-center gap-1.5 text-warm-300 text-xs">
          <svg width="8" height="12" viewBox="0 0 8 14" fill="none">
            <line x1="4" y1="1" x2="4" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="1" y1="5" x2="7" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span>Giáo Xứ · Hệ thống nội bộ v1.0</span>
        </div>
      </div>
    </div>
  );
}
