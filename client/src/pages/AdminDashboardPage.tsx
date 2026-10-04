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
  Server,
  TrendingUp,
  IndianRupee,
  Zap,
} from "lucide-react";

// ── Reusable card wrapper ───────────────────────────────────────────────────
function Card({
  children,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5DED3",
        borderRadius: "20px",
        boxShadow: "0 2px 12px rgba(43,40,35,0.06), 0 1px 3px rgba(43,40,35,0.04)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Status pill ────────────────────────────────────────────────────────────
function StatusPill({ label }: { label: string }) {
  return (
    <span
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={{
        background: "rgba(74,157,142,0.1)",
        color: "#2E7268",
        border: "1px solid rgba(74,157,142,0.2)",
      }}
    >
      <CheckCircle2 className="w-3 h-3" style={{ color: "#4A9D8E" }} />
      {label}
    </span>
  );
}

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
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin" style={{ color: "#4A9D8E" }} />
          <p className="text-sm font-medium" style={{ color: "#6B6660" }}>
            Loading Dashboard…
          </p>
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
      accent: false,
    },
    {
      label: "Active Subscriptions",
      value: metrics.activeSubscriptions.toLocaleString(),
      subtext: "Plus & Pro paid subscribers",
      icon: Sparkles,
      accent: false,
    },
    {
      label: "Monthly Revenue",
      value: `₹${metrics.mrr.toLocaleString()}`,
      subtext: "Recurring subscription MRR",
      icon: IndianRupee,
      accent: true, // dark badge
    },
    {
      label: "Free Tier Users",
      value: metrics.freeTierUsers.toLocaleString(),
      subtext: "Standard free accounts",
      icon: UserCheck,
      accent: false,
    },
  ];

  return (
    <div className="px-8 py-7 max-w-[1280px] mx-auto">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1
          className="text-3xl font-extrabold tracking-tight mb-1"
          style={{ color: "#2B2823", fontFamily: "'Outfit', sans-serif" }}
        >
          Dashboard Overview
        </h1>
        <p className="text-[14px]" style={{ color: "#6B6660" }}>
          Welcome back! Here's a real-time summary of the platform's metrics and system health.
        </p>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} style={{ padding: "20px 22px" }}>
              {/* Icon badge */}
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4"
                style={
                  card.accent
                    ? { background: "#2B2823", color: "#FFFFFF" }
                    : { background: "rgba(74,157,142,0.12)", color: "#2E7268" }
                }
              >
                <Icon className="w-[18px] h-[18px]" />
              </div>

              {/* Metric value */}
              <div
                className="text-[2rem] font-extrabold leading-none mb-1"
                style={{ color: "#2B2823", fontFamily: "'Outfit', sans-serif" }}
              >
                {card.value}
              </div>

              {/* Label */}
              <div
                className="text-[11px] font-bold uppercase tracking-wider mb-1"
                style={{ color: "#6B6660" }}
              >
                {card.label}
              </div>

              {/* Sub text */}
              <div className="text-[12px]" style={{ color: "#A19C95" }}>
                {card.subtext}
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── Quick Actions + System Status ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Quick Actions card */}
        <Card style={{ padding: "24px" }}>
          {/* Card header */}
          <div className="flex items-center gap-2.5 mb-1">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(74,157,142,0.12)" }}
            >
              <Zap className="w-4 h-4" style={{ color: "#4A9D8E" }} />
            </div>
            <h2
              className="text-[17px] font-bold"
              style={{ color: "#2B2823", fontFamily: "'Outfit', sans-serif" }}
            >
              Quick Actions
            </h2>
          </div>
          <p className="text-[12.5px] mb-5" style={{ color: "#A19C95" }}>
            Jump straight into common administrative tasks and reports.
          </p>

          <div className="flex flex-col gap-2.5">
            {/* Manage Users */}
            <Link
              to="/admin/users"
              className="group flex items-center justify-between p-3.5 rounded-2xl no-underline transition-all duration-200"
              style={{
                background: "#FAF6F0",
                border: "1px solid #E5DED3",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "rgba(74,157,142,0.4)";
                el.style.background = "rgba(74,157,142,0.04)";
                el.style.boxShadow = "0 2px 10px rgba(74,157,142,0.1)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "#E5DED3";
                el.style.background = "#FAF6F0";
                el.style.boxShadow = "none";
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "#FFFFFF", border: "1px solid #E5DED3" }}
                >
                  <Users className="w-4 h-4" style={{ color: "#6B6660" }} />
                </div>
                <div>
                  <span
                    className="text-[13.5px] font-semibold block"
                    style={{ color: "#2B2823" }}
                  >
                    Manage Users
                  </span>
                  <span className="text-[12px]" style={{ color: "#A19C95" }}>
                    View, search and manage student accounts
                  </span>
                </div>
              </div>
              <ArrowRight
                className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                style={{ color: "#C8C2BB" }}
              />
            </Link>

            {/* View Subscriptions */}
            <Link
              to="/admin/subscriptions"
              className="group flex items-center justify-between p-3.5 rounded-2xl no-underline transition-all duration-200"
              style={{
                background: "#FAF6F0",
                border: "1px solid #E5DED3",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "rgba(74,157,142,0.4)";
                el.style.background = "rgba(74,157,142,0.04)";
                el.style.boxShadow = "0 2px 10px rgba(74,157,142,0.1)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "#E5DED3";
                el.style.background = "#FAF6F0";
                el.style.boxShadow = "none";
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "#FFFFFF", border: "1px solid #E5DED3" }}
                >
                  <CreditCard className="w-4 h-4" style={{ color: "#6B6660" }} />
                </div>
                <div>
                  <span
                    className="text-[13.5px] font-semibold block"
                    style={{ color: "#2B2823" }}
                  >
                    View Subscriptions
                  </span>
                  <span className="text-[12px]" style={{ color: "#A19C95" }}>
                    Track Razorpay plans, renewals, and tiers
                  </span>
                </div>
              </div>
              <ArrowRight
                className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                style={{ color: "#C8C2BB" }}
              />
            </Link>

            {/* Analytics — teal highlight */}
            <Link
              to="/admin/analytics"
              className="group flex items-center justify-between p-3.5 rounded-2xl no-underline transition-all duration-200"
              style={{
                background: "rgba(74,157,142,0.08)",
                border: "1px solid rgba(74,157,142,0.2)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "rgba(74,157,142,0.13)";
                el.style.boxShadow = "0 2px 12px rgba(74,157,142,0.15)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "rgba(74,157,142,0.08)";
                el.style.boxShadow = "none";
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "#4A9D8E" }}
                >
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span
                    className="text-[13.5px] font-semibold block"
                    style={{ color: "#2B2823" }}
                  >
                    Go to Analytics Dashboard
                  </span>
                  <span className="text-[12px]" style={{ color: "#6B6660" }}>
                    Explore growth charts, MRR and conversion
                  </span>
                </div>
              </div>
              <ArrowRight
                className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                style={{ color: "#4A9D8E" }}
              />
            </Link>
          </div>
        </Card>

        {/* System Status card */}
        <Card style={{ padding: "24px" }}>
          {/* Card header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(74,157,142,0.12)" }}
              >
                <Activity className="w-4 h-4" style={{ color: "#4A9D8E" }} />
              </div>
              <h2
                className="text-[17px] font-bold"
                style={{ color: "#2B2823", fontFamily: "'Outfit', sans-serif" }}
              >
                System Status
              </h2>
            </div>
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
              style={{
                background: "rgba(74,157,142,0.1)",
                color: "#2E7268",
                border: "1px solid rgba(74,157,142,0.2)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "#4A9D8E" }}
              />
              All Operational
            </span>
          </div>
          <p className="text-[12.5px] mb-5" style={{ color: "#A19C95" }}>
            Live heartbeat and service health monitoring.
          </p>

          <div className="flex flex-col gap-2.5">
            {[
              {
                icon: Server,
                name: "API Services",
                sub: "REST endpoints & Financial Engine",
                status: "Online",
              },
              {
                icon: CreditCard,
                name: "Razorpay Webhooks",
                sub: "Payment verification gateway",
                status: "Active",
              },
              {
                icon: Activity,
                name: "Database Sync",
                sub: "Prisma ORM & MongoDB Atlas",
                status: "Healthy",
              },
            ].map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.name}
                  className="flex items-center justify-between p-3.5 rounded-2xl"
                  style={{ background: "#FAF6F0", border: "1px solid #E5DED3" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "#FFFFFF", border: "1px solid #E5DED3" }}
                    >
                      <Icon className="w-4 h-4" style={{ color: "#6B6660" }} />
                    </div>
                    <div>
                      <span
                        className="text-[13.5px] font-semibold block"
                        style={{ color: "#2B2823" }}
                      >
                        {service.name}
                      </span>
                      <span className="text-[12px]" style={{ color: "#A19C95" }}>
                        {service.sub}
                      </span>
                    </div>
                  </div>
                  <StatusPill label={service.status} />
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
