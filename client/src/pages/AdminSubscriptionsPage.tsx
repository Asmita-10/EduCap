import { useEffect, useState } from "react";
import adminApi from "../services/adminApi";
import { CreditCard, RefreshCw, Mail, Calendar, Sparkles, CheckCircle2, XCircle, Clock } from "lucide-react";

const AdminSubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubs = async () => {
      try {
        const res = await adminApi.get("/api/admin/subscriptions");
        setSubscriptions(res.data.subscriptions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubs();
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-['Outfit'] text-[var(--primary)] tracking-tight">
              Subscriptions
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Real-time tracking of active memberships, renewal cycles, and Razorpay billing records.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-gray-500">
            <RefreshCw className="w-6 h-6 animate-spin text-[var(--accent)] mr-2" />
            <span className="text-sm font-medium">Loading subscriptions...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold font-['Outfit'] text-[var(--primary)] uppercase tracking-wider">
                    Subscription ID
                  </th>
                  <th className="px-6 py-4 text-xs font-bold font-['Outfit'] text-[var(--primary)] uppercase tracking-wider">
                    Subscriber
                  </th>
                  <th className="px-6 py-4 text-xs font-bold font-['Outfit'] text-[var(--primary)] uppercase tracking-wider">
                    Tier Plan
                  </th>
                  <th className="px-6 py-4 text-xs font-bold font-['Outfit'] text-[var(--primary)] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold font-['Outfit'] text-[var(--primary)] uppercase tracking-wider">
                    Renewal Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subscriptions.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono font-medium text-[var(--primary)]">
                      {s.razorpaySubId}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      {s.user?.email || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        s.tier === "PRO" 
                          ? "bg-[var(--primary)] text-white" 
                          : "bg-[var(--accent)] text-white"
                      }`}>
                        <Sparkles className="w-3 h-3" />
                        {s.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        s.status === "ACTIVE" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                          : s.status === "CANCELLED" 
                          ? "bg-red-50 text-red-700 border border-red-200" 
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {s.status === "ACTIVE" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        {s.status === "CANCELLED" && <XCircle className="w-3.5 h-3.5 text-red-600" />}
                        {s.status !== "ACTIVE" && s.status !== "CANCELLED" && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {new Date(s.currentPeriodEnd).toLocaleDateString()}
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

export default AdminSubscriptionsPage;
