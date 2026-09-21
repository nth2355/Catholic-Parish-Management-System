import { useState } from "react";
import { Button, Input } from "../components/ui";
import type { UserRole } from "../App";

export default function LoginScreen({ onLogin }: { onLogin: (role: UserRole) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (role: UserRole) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin(role);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center p-4">
      {/* Background subtle pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-navy-50 rounded-full opacity-30 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-50 rounded-full opacity-40 -translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-navy-900 rounded-2xl shadow-md mb-4">
            {/* Minimal cross */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <line x1="12" y1="3" x2="12" y2="21" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="5" y1="9" x2="19" y2="9" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="8" y1="21" x2="16" y2="21" stroke="#C9973A" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-navy-900" style={{ fontFamily: "var(--font-display)" }}>
            Giáo Lý Viên
          </h1>
          <p className="text-sm text-warm-500 mt-1">Hệ thống quản lý giáo lý</p>
          <p className="text-xs text-warm-400 mt-0.5">Giáo xứ • Mùa vụ 2024–2025</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-warm-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-warm-900 mb-5" style={{ fontFamily: "var(--font-display)" }}>
            Đăng nhập
          </h2>

          <div className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="email@giaoxu.vn"
              value={email}
              onChange={setEmail}
            />
            <Input
              label="Mật khẩu"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-warm-600">
                <input type="checkbox" className="rounded border-warm-300 text-navy-900" />
                Ghi nhớ đăng nhập
              </label>
              <button className="text-navy-700 hover:text-navy-900 font-medium cursor-pointer">
                Quên mật khẩu?
              </button>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full mt-1"
              onClick={() => handleSubmit("admin")}
              disabled={loading}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </div>

          {/* Demo accounts */}
          <div className="mt-6 pt-5 border-t border-warm-100">
            <p className="text-xs text-warm-400 text-center mb-3">Tài khoản demo</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSubmit("admin")}
                className="flex flex-col items-center gap-1 p-3 rounded-lg border border-warm-200 hover:border-navy-200 hover:bg-navy-50 cursor-pointer text-left"
              >
                <span className="text-xs font-semibold text-navy-800">Ban Điều Hành</span>
                <span className="text-xs text-warm-400">Admin</span>
              </button>
              <button
                onClick={() => handleSubmit("catechist")}
                className="flex flex-col items-center gap-1 p-3 rounded-lg border border-warm-200 hover:border-gold-200 hover:bg-gold-50 cursor-pointer text-left"
              >
                <span className="text-xs font-semibold text-gold-700">Giáo Lý Viên</span>
                <span className="text-xs text-warm-400">Catechist</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-warm-400 mt-6">
          © 2025 Giáo Xứ. Hệ thống nội bộ.
        </p>
      </div>
    </div>
  );
}
