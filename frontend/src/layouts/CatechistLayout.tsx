import React, { useState } from "react";
import { HomeIcon, BookOpenIcon, ClipboardCheckIcon, UserIcon } from "../components/ui";
import CatechistHome from "../screens/catechist/CatechistHome";
import CatechistClasses from "../screens/catechist/CatechistClasses";
import MobileAttendance from "../screens/catechist/MobileAttendance";
import CatechistProfile from "../screens/catechist/CatechistProfile";

type CatechistTab = "home" | "classes" | "attend" | "me";

const tabs: { id: CatechistTab; label: string; icon: (active: boolean) => React.ReactElement }[] = [
  {
    id: "home",
    label: "Trang chủ",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: "classes",
    label: "Lớp học",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "none" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" strokeWidth={active ? "2.5" : "2"} />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" strokeWidth={active ? "2.5" : "2"} />
      </svg>
    ),
  },
  {
    id: "attend",
    label: "Điểm danh",
    icon: (_active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="m9 14 2 2 4-4" strokeWidth="2.5" />
      </svg>
    ),
  },
  {
    id: "me",
    label: "Của tôi",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" fill={active ? "currentColor" : "none"} />
      </svg>
    ),
  },
];

export default function CatechistLayout({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<CatechistTab>("home");

  const content: Record<CatechistTab, React.ReactElement> = {
    home: <CatechistHome onAttend={() => setActiveTab("attend")} />,
    classes: <CatechistClasses />,
    attend: <MobileAttendance />,
    me: <CatechistProfile onLogout={onLogout} />,
  };

  return (
    <div className="flex flex-col h-full bg-warm-50 max-w-md mx-auto relative">
      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {content[activeTab]}
      </div>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-warm-200 safe-area-bottom z-40">
        <div className="flex">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            const isAttend = tab.id === "attend";
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 pt-2 pb-3 cursor-pointer relative
                  ${isAttend ? "-mt-5" : ""}
                  ${isActive ? "text-navy-900" : "text-warm-400"}`}
              >
                {isAttend ? (
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg
                    ${isActive ? "bg-navy-900 text-white" : "bg-navy-900 text-white"}`}>
                    {tab.icon(isActive)}
                  </div>
                ) : (
                  tab.icon(isActive)
                )}
                <span className={`text-xs font-medium leading-none ${isAttend ? "mt-1" : ""}`}>
                  {tab.label}
                </span>
                {isActive && !isAttend && (
                  <span className="absolute top-1.5 w-1 h-1 bg-navy-900 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
