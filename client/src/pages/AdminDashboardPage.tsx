import { useEffect, useState } from "react";
import adminApi from "../services/adminApi";
import { Link } from "react-router-dom";
import { 
  Users, 
  Sparkles, 
  UserCheck, 
  ArrowRight, 
  Activity, 
  CheckCircle2, 
  CreditCard, 
  RefreshCw,
  Shield,
  Server,
  Zap,
  TrendingUp,
  IndianRupee
} from "lucide-react";

export default function AdminDashboardPage() {
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
          <RefreshCw className="w-7 h-7 animate-spin text-[#3B8A78]" />
          <p className="text-sm font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { 
      label: "TOTAL USERS", 
      value: metrics.totalUsers.toLocaleString(), 
      subtext: "Registered student accounts",
      icon: Users, 
      iconBg: "bg-[#C8EADF] text-[#2D6A5D]",
    },
    { 
      label: "ACTIVE SUBSCRIPTIONS", 
      value: metrics.activeSubscriptions.toLocaleString(), 
      subtext: "Plus & Pro paid subscribers",
      icon: Sparkles, 
      iconBg: "bg-[#C8EADF] text-[#2D6A5D]",
    },
    { 
      label: "MONTHLY REVENUE (MRR)", 
      value: `₹${metrics.mrr.toLocaleString()}`, 
      subtext: "Recurring subscription revenue",
      icon: IndianRupee, 
      iconBg: "bg-[#111827] text-white",
    },
    { 
      label: "FREE TIER USERS", 
      value: metrics.freeTierUsers.toLocaleString(), 
      subtext: "Standard free accounts",
      icon: UserCheck, 
      iconBg: "bg-[#C8EADF] text-[#2D6A5D]",
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 pb-10">
      {/* Section Title Sub-Header */}
      <div className="flex flex-col">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider bg-gray-200/80 text-gray-700 border border-gray-300/60 shadow-2xs">
            <Shield className="w-3.5 h-3.5 text-gray-600" />
            ADMIN PORTAL
          </span>
        </div>
        <h1 className="text-4xl font-extrabold text-[#111827] tracking-tight mt-1 font-['Outfit']">
          Dashboard Overview
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Welcome back! Here is a real-time summary of the platform's metrics and system health.
        </p>
      </div>

      {/* Top KPI Metric Cards (4-Column Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx} 
              className="bg-[#FAF9F6] border border-[#E2DFD8] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-start"
            >
              <div className="mb-4">
                <div className={`p-3 rounded-xl inline-flex items-center justify-center ${card.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="flex flex-col">
                <p className="text-xs font-bold text-gray-700 tracking-wider uppercase mb-1">
                  {card.label}
                </p>
                <h3 className="text-3xl font-extrabold text-[#111827] my-1 font-['Outfit'] leading-none">
                  {card.value}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {card.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions & System Status Section (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2 items-stretch">
        {/* Left Card Container: Quick Actions */}
        <div className="bg-[#FAF9F6] border border-[#E2DFD8] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-[#C8EADF] text-[#2D6A5D] flex items-center justify-center">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#111827] font-['Outfit']">
                Quick Actions
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 mb-4">
              Jump straight into common administrative tasks and reports.
            </p>
            
            <div className="flex flex-col gap-3">
              {/* 1. Manage Users */}
              <Link 
                to="/admin/users" 
                className="group flex items-center justify-between p-3.5 rounded-xl border border-[#E5E2DC] bg-white hover:border-[#3B8A78] hover:shadow-sm transition-all duration-200 no-underline"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#E8E6E1] text-[#111827] flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[#111827] block">Manage Users</span>
                    <span className="text-xs text-gray-500">View, search and manage student accounts</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#3B8A78] group-hover:translate-x-0.5 transition-all" />
              </Link>

              {/* 2. View Subscriptions */}
              <Link 
                to="/admin/subscriptions" 
                className="group flex items-center justify-between p-3.5 rounded-xl border border-[#E5E2DC] bg-white hover:border-[#3B8A78] hover:shadow-sm transition-all duration-200 no-underline"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#E8E6E1] text-[#111827] flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[#111827] block">View Subscriptions</span>
                    <span className="text-xs text-gray-500">Track Razorpay plans, renewals, and tiers</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#3B8A78] group-hover:translate-x-0.5 transition-all" />
              </Link>

              {/* 3. Go to Analytics Dashboard */}
              <Link 
                to="/admin/analytics" 
                className="group flex items-center justify-between p-3.5 rounded-xl border border-[#BDE3D8] bg-[#E2F2EE] hover:bg-[#D5EFE8] transition-all duration-200 no-underline"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#BDE3D8] text-[#1E5D50] flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[#1E5D50] block">Go to Analytics Dashboard</span>
                    <span className="text-xs text-gray-500">Explore growth charts, MRR and conversion</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#1E5D50] group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Card Container: System Status */}
        <div className="bg-[#FAF9F6] border border-[#E2DFD8] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#D8F0EA] text-[#1E5D50] flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <h2 className="text-2xl font-extrabold text-[#111827] font-['Outfit']">
                  System Status
                </h2>
              </div>
              <span className="bg-[#D8F0EA] text-[#1E5D50] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-[#BDE3D8]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                All Operational
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 mb-4">
              Live heartbeat and service health monitoring.
            </p>

            <div className="flex flex-col gap-3">
              {/* 1. API Services */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-[#E5E2DC]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#E8E6E1] text-gray-600 flex items-center justify-center shrink-0">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[#111827] block">API Services</span>
                    <span className="text-xs text-gray-500">REST endpoints & Financial Engine</span>
                  </div>
                </div>
                <span className="bg-[#D8F0EA] text-[#1E5D50] text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 border border-[#BDE3D8]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1E5D50]" />
                  Online
                </span>
              </div>

              {/* 2. Razorpay Webhooks */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-[#E5E2DC]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#E8E6E1] text-gray-600 flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[#111827] block">Razorpay Webhooks</span>
                    <span className="text-xs text-gray-500">Payment verification gateway</span>
                  </div>
                </div>
                <span className="bg-[#D8F0EA] text-[#1E5D50] text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 border border-[#BDE3D8]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1E5D50]" />
                  Active
                </span>
              </div>

              {/* 3. Database Sync */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-[#E5E2DC]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#E8E6E1] text-gray-600 flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[#111827] block">Database Sync</span>
                    <span className="text-xs text-gray-500">Prisma ORM & MongoDB Atlas</span>
                  </div>
                </div>
                <span className="bg-[#D8F0EA] text-[#1E5D50] text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 border border-[#BDE3D8]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1E5D50]" />
                  Healthy
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
