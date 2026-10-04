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
  UserCircle2,
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
    <aside
      className="w-60 shrink-0 h-screen flex flex-col"
      style={{ background: "linear-gradient(180deg, #1A1F28 0%, #1E242E 100%)" }}
    >
      {/* Brand Header */}
      <div className="px-5 pt-6 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Link to="/admin/dashboard" className="flex items-center gap-2.5 no-underline">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #4A9D8E 0%, #3a8070 100%)" }}
          >
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[17px] font-bold text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              EduCap
            </span>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest"
              style={{ background: "rgba(74,157,142,0.18)", color: "#4A9D8E", border: "1px solid rgba(74,157,142,0.25)" }}
            >
              Admin
            </span>
          </div>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 no-underline"
              style={
                isActive
                  ? {
                      background: "rgba(74,157,142,0.15)",
                      border: "1px solid rgba(74,157,142,0.2)",
                      color: "#ffffff",
                    }
                  : {
                      color: "rgba(255,255,255,0.5)",
                      border: "1px solid transparent",
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)";
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }
              }}
            >
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
                  style={{ background: "#4A9D8E" }}
                />
              )}
              <Icon
                className="w-4 h-4 shrink-0"
                style={{ color: isActive ? "#4A9D8E" : "inherit" }}
              />
              <span className="text-[13.5px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2.5 px-2 pt-4 pb-1">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "rgba(74,157,142,0.15)", border: "1px solid rgba(74,157,142,0.2)" }}
          >
            <UserCircle2 className="w-4 h-4" style={{ color: "#4A9D8E" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10.5px] font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>
              Logged in as
            </p>
            <p className="text-[12.5px] font-semibold text-white truncate">
              {admin?.email || "admin@gmail.com"}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-2 flex items-center gap-2 px-2 py-2 rounded-lg w-full text-left transition-all duration-150 cursor-pointer"
          style={{ color: "rgba(255,255,255,0.4)", border: "none", background: "transparent", fontSize: "12px" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "#f87171";
            (e.currentTarget as HTMLElement).style.background = "rgba(248,113,113,0.07)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)";
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
