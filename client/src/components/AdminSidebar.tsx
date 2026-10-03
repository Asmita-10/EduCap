import { Link, useLocation, useNavigate } from "react-router-dom";
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

export default function AdminSidebar() {
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
    <aside className="w-64 bg-[#1E232A] flex flex-col justify-between shrink-0 h-screen select-none">
      <div>
        {/* Brand Header */}
        <div className="px-6 py-5 border-b border-gray-700/40">
          <Link to="/admin/dashboard" className="flex items-center gap-3 no-underline">
            <div className="w-9 h-9 rounded-xl bg-[#2A313C] flex items-center justify-center text-emerald-400">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-['Outfit'] text-white tracking-tight">
                EduCap
              </span>
              <span className="bg-[#2A313C] text-gray-300 text-xs px-2 py-0.5 rounded-full uppercase font-bold tracking-wider border border-gray-600/40">
                Admin
              </span>
            </div>
          </Link>
        </div>
        
        {/* Navigation Items */}
        <nav className="p-3 mt-3 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`relative flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm ${
                  isActive
                    ? "bg-[#3B8A78]/30 text-white font-semibold shadow-sm border border-[#3B8A78]/50"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#3B8A78] rounded-r" />
                )}
                <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-gray-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-700/50">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-full bg-[#2A313C] border border-gray-600/50 flex items-center justify-center shrink-0 text-white">
            <User className="w-4 h-4 text-gray-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 font-medium">Logged in as</p>
            <p className="text-sm font-medium text-white truncate">
              {admin?.email || "admin@gmail.com"}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-gray-300 hover:text-red-400 text-xs mt-2 flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors cursor-pointer w-full text-left"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
