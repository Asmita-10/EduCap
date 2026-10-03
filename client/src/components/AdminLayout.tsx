import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAdminStore } from "../store/useAdminStore";
import adminApi from "../services/adminApi";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  TrendingUp, 
  Settings, 
  LogOut, 
  GraduationCap,
  User
} from "lucide-react";

const AdminLayout = () => {
  const { admin, logout } = useAdminStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await adminApi.post("/api/admin/logout");
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      logout();
      navigate("/login");
    }
  };

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Subscriptions", path: "/admin/subscriptions", icon: CreditCard },
    { name: "Analytics", path: "/admin/analytics", icon: TrendingUp },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-[#2B2823]">
      {/* ═══ SIDEBAR (Dark Slate) ═══════════════════════════ */}
      <aside className="w-64 bg-[#1e293b] flex flex-col justify-between shrink-0">
        <div>
          {/* Logo / Brand */}
          <div className="px-5 py-5 border-b border-white/10">
            <Link to="/admin/dashboard" className="flex items-center gap-3 no-underline">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold font-['Outfit'] text-white tracking-tight">
                  EduCap
                </span>
                <span className="text-[9px] font-bold text-white bg-white/15 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Admin
                </span>
              </div>
            </Link>
          </div>
          
          {/* Navigation */}
          <nav className="p-3 mt-2 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-[13px] ${
                    isActive
                      ? "bg-[#509387] text-white shadow-md shadow-teal-900/20"
                      : "text-slate-300 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <Icon className={`w-[18px] h-[18px] ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* User Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shrink-0 shadow-sm">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-slate-400 font-medium">Logged in as</p>
              <p className="text-xs font-semibold text-white truncate">{admin?.email || "admin@educap.io"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-transparent hover:border-red-500/20 transition-all duration-200 mt-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ═══════════════════════════════════ */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 z-10">
          <h2 className="text-lg font-bold font-['Outfit'] text-[var(--primary)]">
            {menuItems.find((m) => location.pathname.startsWith(m.path))?.name || "Admin Panel"}
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-50 border border-gray-200 text-xs font-semibold text-[var(--primary)]">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Welcome, {admin?.name || "Admin"}</span>
            </div>
            {/* Header Avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center shadow-sm border-2 border-white">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8 bg-slate-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
