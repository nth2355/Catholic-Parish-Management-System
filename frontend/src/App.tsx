import { useState } from "react";
import LoginScreen from "./screens/LoginScreen";
import AdminLayout from "./layouts/AdminLayout";
import CatechistLayout from "./layouts/CatechistLayout";

export type UserRole = "admin" | "catechist";

export default function App() {
  const [role, setRole] = useState<UserRole | null>(null);

  if (!role) {
    return <LoginScreen onLogin={setRole} />;
  }

  if (role === "admin") {
    return <AdminLayout onLogout={() => setRole(null)} />;
  }

  return <CatechistLayout onLogout={() => setRole(null)} />;
}
