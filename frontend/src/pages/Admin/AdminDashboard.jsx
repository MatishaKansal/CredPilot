import {
  useEffect,
  useState,
} from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  ShieldCheck,
  Users,
  UserCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAdminDashboard } from "../../services/adminAPI";

const disbursalTrend = [
  { month: "Jan", amount: 4.2 },
  { month: "Feb", amount: 5.8 },
  { month: "Mar", amount: 5.1 },
  { month: "Apr", amount: 7.4 },
  { month: "May", amount: 8.9 },
  { month: "Jun", amount: 8.1 },
];

const loanTypeMix = [
  { name: "Home", value: 44, color: "#1d4ed8" },
  { name: "Personal", value: 28, color: "#7c3aed" },
  { name: "Car", value: 18, color: "#0891b2" },
  { name: "Education", value: 10, color: "#059669" },
];

const employeePerformance = [
  { name: "Arjun", approved: 38, rejected: 9 },
  { name: "Meera", approved: 44, rejected: 6 },
  { name: "Vikram", approved: 29, rejected: 14 },
  { name: "Divya", approved: 51, rejected: 4 },
  { name: "Rahul S.", approved: 33, rejected: 11 },
];

const recentAlerts = [
  {
    title: "Spike in rejection rate — Branch 3",
    desc: "Rejection rate jumped from 12% to 34% in last 48 hours",
    time: "Today, 9:00 AM",
    status: "warning",
    icon: AlertCircle,
  },
  {
    title: "SLA breach — Vikram Kumar",
    desc: "4 cases exceeded 2-day review window",
    time: "Today, 8:30 AM",
    status: "warning",
    icon: Clock,
  },
  {
    title: "Monthly target reached",
    desc: "June disbursal crossed Rs. 8 Cr ahead of schedule",
    time: "Yesterday",
    status: "success",
    icon: CheckCircle2,
  },
  {
    title: "New employee onboarded",
    desc: "Divya Menon activated on the platform",
    time: "2 days ago",
    status: "info",
    icon: UserCheck,
  },
];

const statusStyles = {
  success: "border-emerald-100 bg-emerald-50 text-emerald-700",
  info: "border-blue-100 bg-blue-50 text-blue-700",
  warning: "border-amber-100 bg-amber-50 text-amber-700",
  danger: "border-red-100 bg-red-50 text-red-700",
};

const MetricCard = ({ label, value, detail, icon: Icon, tone }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
        <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
      </div>
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}>
        <Icon size={18} />
      </div>
    </div>
    <p className="mt-3 text-sm text-slate-500">{detail}</p>
  </div>
);

const SectionHeader = ({ title, subtitle, action }) => (
  <div className="mb-4 flex items-start justify-between gap-3">
    <div>
      <h2 className="text-base font-bold text-slate-950">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
    {action && (
      <button className="text-sm font-semibold text-blue-700 hover:text-blue-900">
        {action}
      </button>
    )}
  </div>
);

const CustomTooltip = ({ active, payload, label, prefix = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="text-slate-400">{label}</p>
      <p className="mt-1 font-bold text-slate-900">
        {prefix}
        {payload[0].value.toLocaleString("en-IN")}
      </p>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    employeeCount: 5,
    adminCount: 0,
    officerCount: 5,
    customerCount: 0,
    assignedCustomerCount: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        const data = await getAdminDashboard();
        setStats(data);
      } catch {
        setStatsLoading(false);
        return;
      }

      setStatsLoading(false);
    };

    loadDashboardStats();
  }, []);

  const activeEmployeeCount = statsLoading ? "..." : stats.employeeCount;

  return (
    <>
      <div>
            {/* Hero banner */}
            <section>
              <div className="overflow-hidden rounded-lg bg-[#43567c] text-white shadow-sm">
                <div className="grid gap-6 p-6 lg:grid-cols-[1fr_260px]">
                  <div>
                    <div className="mb-5 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-emerald-300/30 bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-100">
                        On track — June target
                      </span>
                      <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100">
                        {activeEmployeeCount} active employees
                      </span>
                    </div>

                    <p className="text-sm text-blue-100">Organisation-wide snapshot</p>
                    <h2 className="mt-2 max-w-xl text-3xl font-bold leading-tight">
                      Rs. 8.1 Cr disbursed in June 2026
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-blue-100">
                      Disbursal is 91% of the monthly target. Address the SLA breach in Branch 3 and reject-rate spike before end of week.
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      {[
                        ["Monthly target", "Rs. 9 Cr"],
                        ["Avg. risk score", "68"],
                        ["NPA rate", "2.1%"],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-lg border border-white/10 bg-white/10 p-3">
                          <p className="text-xs text-blue-100">{label}</p>
                          <p className="mt-1 text-lg font-bold">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/10 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Target completion</p>
                      <span className="text-2xl font-bold">91%</span>
                    </div>
                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/15">
                      <div className="h-full w-[91%] rounded-full bg-emerald-400" />
                    </div>
                    <div className="mt-5 space-y-3">
                      {[
                        ["Total applications", "263"],
                        ["Approved & disbursed", "195"],
                        ["Under review", "47"],
                      ].map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between text-sm">
                          <span className="text-blue-100">{label}</span>
                          <span className="font-semibold">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Metric cards */}
            <section className="mt-4 grid gap-4 md:grid-cols-4">
              <MetricCard
                label="Total applications"
                value="263"
                detail="June — 18% up vs May"
                icon={FileText}
                tone="bg-blue-50 text-blue-700"
              />
              <MetricCard
                label="Amount disbursed"
                value="₹8.1 Cr"
                detail="91% of June target"
                icon={DollarSign}
                tone="bg-emerald-50 text-emerald-700"
              />
              <MetricCard
                label="Active employees"
                value={activeEmployeeCount}
                detail={`${stats.officerCount} officers and ${stats.adminCount} admins in DB`}
                icon={Users}
                tone="bg-amber-50 text-amber-700"
              />
              <MetricCard
                label="Avg. risk score"
                value="68"
                detail="2 pts higher than May"
                icon={ShieldCheck}
                tone="bg-purple-50 text-purple-700"
              />
            </section>

            {/* Charts */}
            <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_360px]">
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <SectionHeader title="Monthly disbursal" subtitle="Total loan amount disbursed (₹ Cr)" />
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={disbursalTrend} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                    <defs>
                      <linearGradient id="disbGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#43567C" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#43567C" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip prefix="₹" />} />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#43567C"
                      strokeWidth={3}
                      fill="url(#disbGradient)"
                      dot={{ r: 3, fill: "#43567C", strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: "#43567C" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <SectionHeader title="Loan type mix" subtitle="June portfolio composition" />
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={loanTypeMix} dataKey="value" innerRadius={58} outerRadius={78} paddingAngle={4}>
                        {loanTypeMix.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {loanTypeMix.map(({ name, value, color }) => (
                    <div key={name} className="flex items-center gap-2 rounded-lg bg-slate-50 p-2.5">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: color }} />
                      <div>
                        <p className="text-xs text-slate-500">{name}</p>
                        <p className="text-sm font-bold text-slate-800">{value}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Employee performance + Alerts */}
            <section className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              {/* Employee performance chart */}
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <SectionHeader title="Employee performance" subtitle="Approvals vs rejections this month" action="Full report" />
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={employeePerformance} margin={{ top: 4, right: 8, left: -22, bottom: 0 }} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="approved" fill="#16a34a" radius={[4, 4, 0, 0]} name="Approved" />
                    <Bar dataKey="rejected" fill="#ef4444" radius={[4, 4, 0, 0]} name="Rejected" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* System alerts */}
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <SectionHeader title="System alerts" subtitle="Issues requiring admin attention" action="View all" />
                <div className="space-y-3">
                  {recentAlerts.map(({ title, desc, time, status, icon: Icon }) => (
                    <div key={title} className="flex gap-3 rounded-lg border border-slate-100 p-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${statusStyles[status]}`}>
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-bold text-slate-900">{title}</p>
                          <span className="shrink-0 text-xs text-slate-400">{time}</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA banner */}
            <section className="mt-4">
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-950">End-of-month audit due in 13 days</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Review flagged NPA cases and resolve SLA breaches before the June 30 compliance window closes.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/admin/reports")}
                    className="flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    Start audit <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </section>
      </div>
    </>
  );
};

export default AdminDashboard;
