import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-[#F2F0ED] font-sans text-[#111827]">
      <AdminSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <div className="flex-1 overflow-auto p-8 bg-[#F2F0ED]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
