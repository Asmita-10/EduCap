import { useEffect, useState } from "react";
import adminApi from "../services/adminApi";
import { Link } from "react-router-dom";
import { 
  Users, 
  Sparkles, 
  TrendingUp, 
  UserCheck, 
  ArrowRight, 
  Activity, 
  CheckCircle2, 
  CreditCard, 
  RefreshCw,
  ShieldCheck,
  Server,
  Zap
} from "lucide-react";

const AdminDashboardPage = () => {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    mrr: 0,
    freeTierUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await adminApi.get("/api/admin/analytics/overview");
        setMetrics(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard metrics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <RefreshCw className="w-7 h-7 animate-spin text-[var(--accent)]" />
          <p className="text-sm font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { 
      label: "Total Users", 
      value: metrics.totalUsers.toLocaleString(), 
      subtext: "Registered student accounts",
      icon: Users, 
      iconBg: "bg-blue-50 text-blue-700 border border-blue-100", // Blue for people metrics
    },
    { 
      label: "Active Subscriptions", 
      value: metrics.activeSubscriptions.toLocaleString(), 
      subtext: "Plus & Pro paid subscribers",
      icon: Sparkles, 
      iconBg: "bg-emerald-50 text-emerald-700 border border-emerald-100", // Green for revenue/growth
    },
    { 
      label: "Monthly Revenue (MRR)", 
      value: `₹${metrics.mrr.toLocaleString()}`, 
      subtext: "Recurring subscription revenue",
      icon: TrendingUp, 
      iconBg: "bg-emerald-50 text-emerald-700 border border-emerald-100", // Green for revenue/growth
    },
    { 
      label: "Free Tier Users", 
      value: metrics.freeTierUsers.toLocaleString(), 
      subtext: "Standard free accounts",
      icon: UserCheck, 
      iconBg: "bg-blue-50 text-blue-700 border border-blue-100", // Blue for people metrics
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 pb-8">
      {/* Header with Eyebrow Admin Badge & Balanced Title */}
      <div className="flex flex-col mb-2">
        <div className="mb-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/15">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Portal
          </span>
        </div>
        <h1 className="text-2xl font-bold font-['Outfit'] text-[var(--primary)] tracking-tight mt-0.5 mb-1">
          Dashboard Overview
        </h1>
        <p className="text-sm text-gray-500">
          Welcome back! Here is a real-time summary of the platform's metrics and system health.
        </p>
      </div>

      {/* Stat Cards Grid (Single clean label per card, no duplicate pills) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx} 
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[var(--accent)] transition-all duration-200 flex flex-col justify-start"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${card.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  {card.label}
                </p>
                <h3 className="text-3xl font-bold font-['Outfit'] text-[var(--primary)] leading-none mb-1.5">
                  {card.value}
                </h3>
                <p className="text-xs text-gray-400 font-normal">
                  {card.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Panels Row: Quick Actions & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-stretch">
        {/* Quick Actions Panel */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold font-['Outfit'] text-[var(--primary)]">
                Quick Actions
              </h2>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Jump straight into common administrative tasks and reports.
            </p>
            
            <div className="flex flex-col gap-3">
              <Link 
                to="/admin/users" 
                className="group flex items-center justify-between p-3.5 rounded-xl border border-gray-200/80 bg-gray-50/60 hover:bg-[var(--accent)]/5 hover:border-[var(--accent)] transition-all duration-200 no-underline"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-[var(--primary)] group-hover:border-[var(--accent)] transition-colors shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-[var(--primary)] block">Manage Users</span>
                    <span className="text-xs text-gray-500">View, search and manage student accounts</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link 
                to="/admin/subscriptions" 
                className="group flex items-center justify-between p-3.5 rounded-xl border border-gray-200/80 bg-gray-50/60 hover:bg-[var(--accent)]/5 hover:border-[var(--accent)] transition-all duration-200 no-underline"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-[var(--primary)] group-hover:border-[var(--accent)] transition-colors shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-[var(--primary)] block">View Active Subscriptions</span>
                    <span className="text-xs text-gray-500">Track Razorpay plans, renewals, and tiers</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link 
                to="/admin/analytics" 
                className="group flex items-center justify-between p-3.5 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 hover:bg-[var(--accent)]/10 hover:border-[var(--accent)] transition-all duration-200 no-underline"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-[var(--accent)] block">Go to Analytics Dashboard</span>
                    <span className="text-xs text-gray-500">Explore growth charts, MRR and conversion</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--accent)] group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>
        </div>

        {/* System Status Panel */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold font-['Outfit'] text-[var(--primary)]">
                  System Status
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                All Operational
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Live heartbeat and service health monitoring.
            </p>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/80 border border-gray-200/60">
                <div className="flex items-center gap-3">
                  <Server className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-sm font-semibold text-[var(--primary)] block">API Services</span>
                    <span className="text-xs text-gray-400">REST endpoints & Financial Engine</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/50">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Online
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/80 border border-gray-200/60">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-sm font-semibold text-[var(--primary)] block">Razorpay Webhooks</span>
                    <span className="text-xs text-gray-400">Payment verification gateway</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/50">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/80 border border-gray-200/60">
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-sm font-semibold text-[var(--primary)] block">Database Sync</span>
                    <span className="text-xs text-gray-400">Prisma ORM & MongoDB Atlas</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/50">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Healthy
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
