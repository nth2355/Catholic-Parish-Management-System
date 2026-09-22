import { useState } from "react";
import parishLogo from "../../assets/images/logoGiaoxuSaNam.jpg";
import type { UserRole } from "../App";
import { Button, Input } from "../components/ui";

export default function LoginScreen({ onLogin }: { onLogin: (role: UserRole) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Đăng nhập thất bại");
      }

      const role = result.data.user.role.toLowerCase() as UserRole;
      const storage = rememberLogin ? localStorage : sessionStorage;
      storage.setItem("authToken", result.data.token);
      storage.setItem("authUser", JSON.stringify(result.data.user));
      onLogin(role);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
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
          <p className="text-sm italic text-warm-600 leading-relaxed mb-4">
            "Lời Chúa là ngọn đèn soi cho con bước, là ánh sáng chỉ đường con đi."* — (Tv 119, 105)
          </p>
          <div className="inline-flex items-center justify-center w-14 h-14 bg-navy-900 rounded-2xl shadow-md mb-4">
            <img
              src={parishLogo}
              alt="Logo Giáo xứ Sa Nam"
              className="w-full h-full object-contain rounded-2xl"
            />
          </div>
          <h1 className="text-2xl font-bold text-navy-900" style={{ fontFamily: "var(--font-display)" }}>
            Sổ Tay Giáo Lý
          </h1>
          <p className="text-sm text-warm-500 mt-1">Hệ thống quản lý giáo lý</p>
          <p className="text-xs text-warm-400 mt-0.5">Giáo xứ Sa Nam</p>
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

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-warm-600">
                <input
                  type="checkbox"
                  checked={rememberLogin}
                  onChange={(event) => setRememberLogin(event.target.checked)}
                  className="rounded border-warm-300 text-navy-900"
                />
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
              onClick={handleSubmit}
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
                onClick={() => {
                  setEmail("admin@parish.local");
                  setPassword("Admin@123456");
                  setError("");
                }}
                className="flex flex-col items-center gap-1 p-3 rounded-lg border border-warm-200 hover:border-navy-200 hover:bg-navy-50 cursor-pointer text-left"
              >
                <span className="text-xs font-semibold text-navy-800">Ban Điều Hành</span>
                <span className="text-xs text-warm-400">Admin</span>
              </button>
              <button
                onClick={() => {
                  setEmail("");
                  setPassword("");
                  setError("Nhập tài khoản giáo lý viên để đăng nhập.");
                }}
                className="flex flex-col items-center gap-1 p-3 rounded-lg border border-warm-200 hover:border-gold-200 hover:bg-gold-50 cursor-pointer text-left"
              >
                <span className="text-xs font-semibold text-gold-700">Giáo Lý Viên</span>
                <span className="text-xs text-warm-400">Catechist</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-warm-400 mt-6">
          © 2025 Giáo Xứ Sa Nam. Hệ thống nội bộ.
        </p>
        <p className="text-center text-xs text-warm-300 mt-6">
          © Developed by Ven. Nguyen Thanh Dat.
        </p>
        
      </div>
    </div>
  );
}
