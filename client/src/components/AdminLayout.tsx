import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

const AdminLayout = () => {
  return (
    <div
      className="admin-root flex h-screen overflow-hidden"
      style={{ fontFamily: "'Inter', system-ui, sans-serif", color: "#2B2823" }}
    >
      <AdminSidebar />
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <AdminHeader />
        {/* Main content area with warm cream + subtle radial gradient matching the site vibe */}
        <div
          className="flex-1 overflow-auto"
          style={{
            background: "radial-gradient(ellipse 90% 60% at 60% -5%, rgba(74,157,142,0.06) 0%, transparent 65%), #FAF6F0",
          }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
