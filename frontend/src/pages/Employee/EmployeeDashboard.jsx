import {
  Area,
  AreaChart,
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
  FileText,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const applicationsTrend = [
  { month: "Jan", count: 42 },
  { month: "Feb", count: 55 },
  { month: "Mar", count: 49 },
  { month: "Apr", count: 63 },
  { month: "May", count: 71 },
  { month: "Jun", count: 68 },
];

const approvalMix = [
  { name: "Approved", value: 38, color: "#16a34a" },
  { name: "Pending", value: 21, color: "#f59e0b" },
  { name: "Rejected", value: 9, color: "#ef4444" },
];

const recentApplications = [
  {
    title: "Rahul Kumar — Home Loan",
    desc: "Rs. 20,00,000 · Income verification pending",
    time: "Today, 10:45 AM",
    status: "warning",
    icon: AlertCircle,
  },
  {
    title: "Priya Sharma — Personal Loan",
    desc: "Rs. 5,00,000 · All documents received",
    time: "Today, 9:12 AM",
    status: "success",
    icon: CheckCircle2,
  },
  {
    title: "Amit Verma — Car Loan",
    desc: "Rs. 8,00,000 · Awaiting address proof",
    time: "Yesterday",
    status: "warning",
    icon: Clock,
  },
  {
    title: "Sunita Patel — Education Loan",
    desc: "Rs. 3,50,000 · Risk score low — review needed",
    time: "2 days ago",
    status: "info",
    icon: TrendingUp,
  },
];


const statusStyles = {
  success: "border-emerald-100 bg-emerald-50 text-emerald-700",
  info: "border-blue-100 bg-blue-50 text-blue-700",
  warning: "border-amber-100 bg-amber-50 text-amber-700",
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

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashData, setDashData] = useState(null);

  useEffect(() => {
    if (!user?.user_id) return;
    fetch(`http://localhost:8000/employee/${user.user_id}/dashboard`)
      .then((res) => res.json())
      .then((data) => setDashData(data))
      .catch(() => {});
  }, [user?.user_id]);

  const firstName = (dashData?.employee?.fullName || user?.name || "").split(" ")[0];
  const assignedCustomerCount = dashData?.assignedCustomerCount ?? "—";

  return (
    <div className="px-4 py-6 md:px-8">
            {/* Hero banner */}
            <section>
              <div className="overflow-hidden rounded-lg bg-[#43567c] text-white shadow-sm">
                <div className="grid gap-6 p-6 lg:grid-cols-[1fr_260px]">
                  <div>
                    <div className="mb-5 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-amber-300/30 bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-100">
                        7 pending reviews
                      </span>
                      <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100">
                        June 2026 cycle
                      </span>
                    </div>

                    <p className="text-sm text-blue-100">Welcome back, {firstName} · Employee performance snapshot</p>
                    <h2 className="mt-2 max-w-xl text-3xl font-bold leading-tight">
                      68 applications processed this month
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-blue-100">
                      Your approval rate is above average. Clear the pending queue before the end-of-day deadline to maintain your SLA score.
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      {[
                        ["Avg. turnaround", "1.4 days"],
                        ["SLA compliance", "94%"],
                        ["Review deadline", "5:00 PM"],
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
                      <p className="text-sm font-semibold">Approval rate</p>
                      <span className="text-2xl font-bold">56%</span>
                    </div>
                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/15">
                      <div className="h-full w-[56%] rounded-full bg-emerald-400" />
                    </div>
                    <div className="mt-5 space-y-3">
                      {[
                        ["Approved", "38"],
                        ["Pending", "21"],
                        ["Rejected", "9"],
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
                label="Total assigned"
                value="68"
                detail="Applications this month"
                icon={FileText}
                tone="bg-blue-50 text-blue-700"
              />
              <MetricCard
                label="Pending review"
                value="7"
                detail="Action needed today"
                icon={Clock}
                tone="bg-amber-50 text-amber-700"
              />
              <MetricCard
                label="Approved"
                value="38"
                detail="56% approval rate"
                icon={CheckCircle2}
                tone="bg-emerald-50 text-emerald-700"
              />
              <MetricCard
                label="Active customers"
                value={assignedCustomerCount}
                detail="In your portfolio"
                icon={Users}
                tone="bg-purple-50 text-purple-700"
              />
            </section>

            {/* Charts */}
            <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_360px]">
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <SectionHeader title="Application volume" subtitle="Monthly intake over the past six months" />
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={applicationsTrend} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                    <defs>
                      <linearGradient id="appGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#43567C" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#43567C" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#43567C"
                      strokeWidth={3}
                      fill="url(#appGradient)"
                      dot={{ r: 3, fill: "#43567C", strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: "#43567C" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <SectionHeader title="Approval breakdown" subtitle="Current month outcome split" />
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={approvalMix} dataKey="value" innerRadius={58} outerRadius={78} paddingAngle={4}>
                        {approvalMix.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-emerald-50 p-3">
                    <p className="text-xs text-emerald-700">Approved</p>
                    <p className="mt-1 text-xl font-bold text-emerald-800">38</p>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-3">
                    <p className="text-xs text-amber-700">Pending</p>
                    <p className="mt-1 text-xl font-bold text-amber-800">21</p>
                  </div>
                  <div className="rounded-lg bg-red-50 p-3">
                    <p className="text-xs text-red-700">Rejected</p>
                    <p className="mt-1 text-xl font-bold text-red-800">9</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Recent + timeline */}
            <section className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              {/* Recent applications */}
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <SectionHeader title="Recent applications" subtitle="Latest submissions in your queue" action="View all" />
                <div className="space-y-3">
                  {recentApplications.map(({ title, desc, time, status, icon: Icon }) => (
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
                      <button className="shrink-0 self-center rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                        Review
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review pipeline */}
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <SectionHeader title="Review pipeline" subtitle="Stage-by-stage status today" />
                <div className="space-y-4">
                  {[
                    { label: "Received", count: 68, done: true },
                    { label: "Document check", count: 61, done: true },
                    { label: "Income verification", count: 54, done: true },
                    { label: "Risk assessment", count: 38, done: false },
                    { label: "Final decision", count: 21, done: false },
                  ].map(({ label, count, done }, index, arr) => (
                    <div key={label} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
                          done ? "border-blue-700 bg-blue-700 text-white" : "border-slate-200 bg-white text-slate-300"
                        }`}>
                          {done ? <CheckCircle2 size={15} /> : <Clock size={14} />}
                        </div>
                        {index < arr.length - 1 && (
                          <div className={`h-7 w-px ${done ? "bg-blue-700" : "bg-slate-200"}`} />
                        )}
                      </div>
                      <div className="flex flex-1 items-start justify-between pt-1">
                        <div>
                          <p className={`text-sm font-semibold ${done ? "text-slate-900" : "text-slate-400"}`}>
                            {label}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {done ? "Completed" : "In progress"}
                          </p>
                        </div>
                        <span className={`text-sm font-bold ${done ? "text-slate-700" : "text-slate-300"}`}>
                          {count}
                        </span>
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
                    <h2 className="text-base font-bold text-slate-950">SLA alert: 3 cases near deadline</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Complete review on Amit Verma, Sunita Patel, and 1 other before 5:00 PM to avoid breach.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/employee/reviews")}
                    className="flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    Review now <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </section>
    </div>
  );
};

export default EmployeeDashboard;