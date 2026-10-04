import { useLocation } from "react-router-dom";
import { useAdminStore } from "../store/useAdminStore";
import { Shield } from "lucide-react";

export default function AdminHeader() {
  const { admin } = useAdminStore();
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname.includes("/admin/users")) return "Users";
    if (location.pathname.includes("/admin/subscriptions")) return "Subscriptions";
    if (location.pathname.includes("/admin/analytics")) return "Analytics";
    if (location.pathname.includes("/admin/settings")) return "Settings";
    return "Dashboard";
  };

  return (
    <header
      className="h-[68px] shrink-0 flex items-center justify-between px-8 z-10"
      style={{
        background: "#FAF6F0",
        borderBottom: "1px solid #E5DED3",
      }}
    >
      {/* Left: page title */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md"
          style={{ background: "rgba(74,157,142,0.08)", border: "1px solid rgba(74,157,142,0.15)" }}
        >
          <Shield className="w-3 h-3" style={{ color: "#4A9D8E" }} />
          <span
            className="text-[10.5px] font-bold uppercase tracking-widest"
            style={{ color: "#4A9D8E" }}
          >
            Admin Portal
          </span>
        </div>
        <span style={{ color: "#D5CEC5", fontSize: "14px" }}>/</span>
        <h1
          className="text-[17px] font-bold"
          style={{ color: "#2B2823", fontFamily: "'Outfit', sans-serif" }}
        >
          {getPageTitle()}
        </h1>
      </div>

      {/* Right: welcome pill + avatar */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 px-3.5 py-2 rounded-full"
          style={{
            background: "#FFFFFF",
            border: "1px solid #E5DED3",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "#4A9D8E" }}
          />
          <span
            className="text-[13px] font-semibold"
            style={{ color: "#2B2823" }}
          >
            Welcome, {admin?.name || "Admin"}
          </span>
        </div>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white select-none"
          style={{
            background: "linear-gradient(135deg, #4A9D8E 0%, #3a8070 100%)",
            boxShadow: "0 2px 8px rgba(74,157,142,0.35)",
          }}
        >
          A
        </div>
      </div>
    </header>
  );
}
