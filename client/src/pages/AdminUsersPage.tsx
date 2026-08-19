import { useEffect, useState } from "react";
import adminApi from "../services/adminApi";
import { Users, RefreshCw, Mail, Calendar, Sparkles } from "lucide-react";

const AdminUsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await adminApi.get("/api/admin/users");
        setUsers(res.data.users);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-['Outfit'] text-[var(--primary)] tracking-tight">
              Manage Users
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Directory of all registered students and their current subscription plans.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-gray-500">
            <RefreshCw className="w-6 h-6 animate-spin text-[var(--accent)] mr-2" />
            <span className="text-sm font-medium">Loading user accounts...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold font-['Outfit'] text-[var(--primary)] uppercase tracking-wider">
                    User Email
                  </th>
                  <th className="px-6 py-4 text-xs font-bold font-['Outfit'] text-[var(--primary)] uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-xs font-bold font-['Outfit'] text-[var(--primary)] uppercase tracking-wider">
                    Joined Date
                  </th>
                  <th className="px-6 py-4 text-xs font-bold font-['Outfit'] text-[var(--primary)] uppercase tracking-wider">
                    Subscription Tier
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-[var(--primary)] flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      {u.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                      {u.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        u.subscription?.tier === "PRO" 
                          ? "bg-[var(--primary)] text-white shadow-sm" 
                          : u.subscription?.tier === "PLUS" 
                          ? "bg-[var(--accent)] text-white shadow-sm" 
                          : "bg-gray-100 text-gray-600 border border-gray-200/60"
                      }`}>
                        {(u.subscription?.tier === "PRO" || u.subscription?.tier === "PLUS") && <Sparkles className="w-3 h-3" />}
                        {u.subscription?.tier || "FREE"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
