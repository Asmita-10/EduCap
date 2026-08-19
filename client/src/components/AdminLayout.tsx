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
  ShieldCheck
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
    <div className="flex h-screen bg-[#FAF6F0] font-sans text-[#2B2823]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6 border-b border-gray-200">
            <Link to="/admin/dashboard" className="flex items-center gap-3 no-underline">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center text-[var(--accent)]">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-['Outfit'] text-[var(--primary)] tracking-tight">
                  EduCap
                </span>
                <span className="text-[10px] font-bold text-white bg-[var(--primary)] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Admin
                </span>
              </div>
            </Link>
          </div>
          
          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${
                    isActive
                      ? "bg-[var(--accent)] text-white shadow-sm font-semibold"
                      : "text-gray-600 hover:bg-gray-100 hover:text-[var(--primary)]"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-500"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50/60">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-gray-500 font-medium">Logged in as</p>
              <p className="text-xs font-semibold text-[var(--primary)] truncate">{admin?.email || "admin@educap.io"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all duration-200 mt-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 z-10">
          <h2 className="text-lg font-bold font-['Outfit'] text-[var(--primary)]">
            {menuItems.find((m) => location.pathname.startsWith(m.path))?.name || "Admin Panel"}
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-100/90 border border-gray-200 text-xs font-semibold text-[var(--primary)]">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Welcome, {admin?.name || "Admin"}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8 bg-[#FAF6F0]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
