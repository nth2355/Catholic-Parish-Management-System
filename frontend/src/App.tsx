import { useState } from "react";
import AdminLayout from "./layouts/AdminLayout";
import CatechistLayout from "./layouts/CatechistLayout";
import LoginScreen from "./screens/LoginScreen";

export type UserRole = "admin" | "catechist";

export default function App() {
  const [role, setRole] = useState<UserRole | null>(null);
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("authUser");
    setRole(null);
  };

  if (!role) {
    return <LoginScreen onLogin={setRole} />;
  }

  if (role === "admin") {
    return <AdminLayout onLogout={handleLogout} />;
  }

  return <CatechistLayout onLogout={handleLogout} />;
}
