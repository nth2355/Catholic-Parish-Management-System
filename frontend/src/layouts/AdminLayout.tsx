import React, { useState } from "react";
import {
  HomeIcon, UsersIcon, BookOpenIcon, CalendarIcon, BarChartIcon,
  SettingsIcon, LogOutIcon, MenuIcon, ChevronLeftIcon, BellIcon,
  AwardIcon, FileTextIcon, ClipboardCheckIcon,
} from "../components/ui";

import AdminDashboard from "../screens/admin/AdminDashboard";
import StudentManagement from "../screens/admin/StudentManagement";
import ClassManagement from "../screens/admin/ClassManagement";
import CatechistManagement from "../screens/admin/CatechistManagement";
import SessionManagement from "../screens/admin/SessionManagement";
import AssessmentsGrades from "../screens/admin/AssessmentsGrades";
import Reports from "../screens/admin/Reports";

type AdminScreen =
  | "dashboard"
  | "students"
  | "classes"
  | "catechists"
  | "sessions"
  | "assessments"
  | "reports"
  | "settings";

const navItems: { id: AdminScreen; label: string; sublabel: string; icon: (s: number) => React.ReactElement }[] = [
  { id: "dashboard", label: "Tổng quan", sublabel: "Dashboard", icon: (s) => <HomeIcon size={s} /> },
  { id: "students", label: "Học sinh", sublabel: "Quản lý", icon: (s) => <UsersIcon size={s} /> },
  { id: "classes", label: "Lớp học", sublabel: "Quản lý", icon: (s) => <BookOpenIcon size={s} /> },
  { id: "catechists", label: "Giáo lý viên", sublabel: "Quản lý", icon: (s) => <ClipboardCheckIcon size={s} /> },
  { id: "sessions", label: "Buổi học", sublabel: "Lịch trình", icon: (s) => <CalendarIcon size={s} /> },
  { id: "assessments", label: "Đánh giá", sublabel: "Điểm số", icon: (s) => <AwardIcon size={s} /> },
  { id: "reports", label: "Báo cáo", sublabel: "Thống kê", icon: (s) => <BarChartIcon size={s} /> },
  { id: "settings", label: "Cài đặt", sublabel: "Hệ thống", icon: (s) => <SettingsIcon size={s} /> },
];

export default function AdminLayout({ onLogout }: { onLogout: () => void }) {
  const [screen, setScreen] = useState<AdminScreen>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const current = navItems.find(n => n.id === screen);

  const screenComponents: Record<AdminScreen, React.ReactElement> = {
    dashboard: <AdminDashboard onNavigate={setScreen} />,
    students: <StudentManagement />,
    classes: <ClassManagement />,
    catechists: <CatechistManagement />,
    sessions: <SessionManagement />,
    assessments: <AssessmentsGrades />,
    reports: <Reports />,
    settings: (
      <div className="p-8 text-center text-warm-400">
        <SettingsIcon size={32} />
        <p className="mt-3 text-sm">Cài đặt hệ thống</p>
      </div>
    ),
  };

  return (
    <div className="flex h-full bg-warm-50">
      {/* Sidebar */}
      <aside
        className={`flex-shrink-0 bg-navy-950 flex flex-col overflow-hidden
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? "w-60" : "w-16"}`}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${!sidebarOpen ? "justify-center" : ""}`}>
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <line x1="12" y1="3" x2="12" y2="21" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="5" y1="9" x2="19" y2="9" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="8" y1="21" x2="16" y2="21" stroke="#C9973A" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-white text-sm font-semibold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                Giáo Lý Viên
              </p>
              <p className="text-white/40 text-xs">Ban Điều Hành</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              title={!sidebarOpen ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-4 py-2.5 cursor-pointer group
                ${!sidebarOpen ? "justify-center" : ""}
                ${screen === item.id
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"}`}
            >
              <span className="flex-shrink-0">
                {item.icon(17)}
              </span>
              {sidebarOpen && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
              {sidebarOpen && screen === item.id && (
                <span className="ml-auto w-1.5 h-1.5 bg-gold-500 rounded-full flex-shrink-0" />
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className={`border-t border-white/10 p-4 flex items-center gap-3 ${!sidebarOpen ? "justify-center" : ""}`}>
          <div className="w-7 h-7 bg-gold-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-gold-400 text-xs font-bold" style={{ fontFamily: "var(--font-display)" }}>AT</span>
          </div>
          {sidebarOpen && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium truncate">Anh Trưởng</p>
                <p className="text-white/40 text-xs truncate">admin@giaoxu.vn</p>
              </div>
              <button
                onClick={onLogout}
                className="text-white/40 hover:text-white cursor-pointer p-1"
                title="Đăng xuất"
              >
                <LogOutIcon size={15} />
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-warm-200 px-5 py-3.5 flex items-center gap-4 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-warm-500 hover:text-warm-800 cursor-pointer p-1 rounded-lg hover:bg-warm-100"
          >
            {sidebarOpen ? <ChevronLeftIcon size={18} /> : <MenuIcon size={18} />}
          </button>

          <div className="flex-1">
            <h1 className="text-sm font-semibold text-warm-900" style={{ fontFamily: "var(--font-display)" }}>
              {current?.label}
            </h1>
            <p className="text-xs text-warm-400">{current?.sublabel}</p>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative text-warm-500 hover:text-warm-800 cursor-pointer p-2 rounded-lg hover:bg-warm-100">
              <BellIcon size={17} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-gold-500 rounded-full" />
            </button>
            <div className="w-7 h-7 bg-navy-100 text-navy-800 rounded-full flex items-center justify-center text-xs font-bold" style={{ fontFamily: "var(--font-display)" }}>
              AT
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {screenComponents[screen]}
        </main>
      </div>
    </div>
  );
}
