import { useLocation } from "react-router-dom";
import { useAdminStore } from "../store/useAdminStore";

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
    <header className="h-20 bg-white border-b border-[#E5E2DC] flex items-center justify-between px-8 shrink-0 z-10">
      <h1 className="text-3xl font-extrabold text-[#111827] font-['Outfit'] tracking-tight">
        {getPageTitle()}
      </h1>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#FAF9F6] border border-[#E5E2DC] text-xs font-semibold text-[#111827]">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Welcome, {admin?.name || "Admin"}</span>
        </div>
        <div className="w-9 h-9 rounded-full bg-[#1E232A] text-white flex items-center justify-center font-bold text-sm shadow-sm border border-[#E5E2DC]">
          A
        </div>
      </div>
    </header>
  );
}
