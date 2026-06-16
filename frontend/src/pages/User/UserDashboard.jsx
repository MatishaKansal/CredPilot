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
  Bell,
  CheckCircle2,
  Clock,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Search,
  ShieldCheck,
  TrendingUp,
  Upload,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

const riskTrend = [
  { month: "Jan", score: 58 },
  { month: "Feb", score: 63 },
  { month: "Mar", score: 61 },
  { month: "Apr", score: 67 },
  { month: "May", score: 72 },
  { month: "Jun", score: 76 },
];

const documentMix = [
  { name: "Done", value: 3, color: "#16a34a" },
  { name: "Pending", value: 2, color: "#f59e0b" },
];

const recentActivity = [
  {
    title: "Income proof verified",
    desc: "Salary slips matched bank statement records",
    time: "Today, 10:45 AM",
    status: "success",
    icon: CheckCircle2,
  },
  {
    title: "PAN and Aadhaar uploaded",
    desc: "Identity documents are ready for officer review",
    time: "Yesterday",
    status: "info",
    icon: Upload,
  },
  {
    title: "Risk score improved",
    desc: "On-time repayments raised your profile score",
    time: "2 days ago",
    status: "success",
    icon: TrendingUp,
  },
  {
    title: "Address proof required",
    desc: "Upload a recent utility bill to avoid delay",
    time: "Pending",
    status: "warning",
    icon: AlertCircle,
  },
];

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Profile", icon: User },
  { label: "Applications", icon: FileText },
  { label: "Documents", icon: Upload },
  { label: "Eligibility", icon: ShieldCheck },
  { label: "Support", icon: MessageCircle },
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

const UserDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#eef3f8] text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[248px_1fr]">
        <aside className="hidden border-r border-white/60 bg-[#071a3f] px-4 py-5 text-white lg:block">
          <div className="mb-8 flex items-center gap-3 px-2">
            <img src={logo} alt="CredPilot" className="h-9 w-9 object-contain" />
            <div>
              <p className="text-lg font-bold leading-none">CredPilot</p>
              <p className="mt-1 text-xs text-blue-200">Applicant workspace</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map(({ label, icon: Icon, active }) => (
              <button
                key={label}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  active
                    ? "bg-white text-[#071a3f] shadow-sm"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={17} />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8 rounded-lg border border-white/10 bg-white/10 p-4">
            <p className="text-sm font-semibold">Need quick help?</p>
            <p className="mt-2 text-xs leading-relaxed text-blue-100">
              A loan advisor is available for your application review.
            </p>
            <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#071a3f]">
              Start chat <ArrowRight size={14} />
            </button>
          </div>

          <button className="mt-6 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-200 hover:bg-red-500/10">
            <LogOut size={17} />
            Logout
          </button>
        </aside>

        <main className="min-w-0">
          <header className="sticky top-0 z-10 border-b border-white/70 bg-white/85 px-4 py-4 backdrop-blur md:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#43567C]">Welcome back, Rahul</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                  Your loan cockpit is ready
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 md:flex">
                  <Search size={16} className="text-slate-400" />
                  <input
                    className="w-52 bg-transparent text-sm outline-none placeholder:text-slate-400"
                    placeholder="Search applications"
                  />
                </div>
                <button className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600">
                  <Bell size={17} />
                  <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500" />
                </button>
                <button
                  onClick={() => navigate("/user/apply-loan")}
                  className="flex items-center gap-2 rounded-lg bg-[#43567C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900"
                >
                  Apply loan <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </header>

          <div className="px-4 py-6 md:px-8">
            <section>
              <div className="overflow-hidden rounded-lg bg-[#43567c] text-white shadow-sm">
                <div className="grid gap-6 p-6 lg:grid-cols-[1fr_260px]">
                  <div>
                    <div className="mb-5 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-emerald-300/30 bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-100">
                        Verification in progress
                      </span>
                      <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100">
                        Application ID CP-2048
                      </span>
                    </div>

                    <p className="text-sm text-blue-100">Home loan application</p>
                    <h2 className="mt-2 max-w-xl text-3xl font-bold leading-tight">
                      Rs. 20,00,000 request is 64% complete
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-blue-100">
                      Your profile is strong. Complete the last address proof step to keep approval on track for the next review window.
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      {[
                        ["Expected EMI", "Rs. 18.2K"],
                        ["Tenure", "12 years"],
                        ["Review date", "18 Jun"],
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
                      <p className="text-sm font-semibold">Approval readiness</p>
                      <span className="text-2xl font-bold">76</span>
                    </div>
                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/15">
                      <div className="h-full w-[76%] rounded-full bg-emerald-400" />
                    </div>
                    <div className="mt-5 space-y-3">
                      {[
                        ["Credit history", "Good"],
                        ["Income stability", "Strong"],
                        ["Document health", "Action needed"],
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

            <section className="mt-4 grid gap-4 md:grid-cols-3">
              <MetricCard
                label="Active loans"
                value="1"
                detail="Home loan under verification"
                icon={FileText}
                tone="bg-blue-50 text-blue-700"
              />
              <MetricCard
                label="Risk score"
                value="76"
                detail="4 points better than last month"
                icon={ShieldCheck}
                tone="bg-emerald-50 text-emerald-700"
              />
              <MetricCard
                label="Docs uploaded"
                value="3 / 5"
                detail="Address proof and bank PDF pending"
                icon={Upload}
                tone="bg-amber-50 text-amber-700"
              />
            </section>

            <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_360px]">
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <SectionHeader title="Risk score trend" subtitle="Your approval profile over six months" />
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={riskTrend} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                    <defs>
                      <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#43567C" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#43567C" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[40, 100]} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#43567C"
                      strokeWidth={3}
                      fill="url(#riskGradient)"
                      dot={{ r: 3, fill: "#43567C", strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: "#43567C" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <SectionHeader title="Document health" subtitle="Current upload completion" />
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={documentMix} dataKey="value" innerRadius={58} outerRadius={78} paddingAngle={4}>
                        {documentMix.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-emerald-50 p-3">
                    <p className="text-xs text-emerald-700">Completed</p>
                    <p className="mt-1 text-xl font-bold text-emerald-800">3</p>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-3">
                    <p className="text-xs text-amber-700">Pending</p>
                    <p className="mt-1 text-xl font-bold text-amber-800">2</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <SectionHeader title="Application timeline" subtitle="Where your loan stands right now" action="View all" />
                <div className="space-y-4">
                  {[
                    { label: "Application submitted", done: true },
                    { label: "Documents collected", done: true },
                    { label: "Income verification", done: true },
                    { label: "Address proof check", done: false },
                    { label: "Final approval", done: false },
                  ].map(({ label, done }, index, arr) => (
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
                      <div className="pt-1">
                        <p className={`text-sm font-semibold ${done ? "text-slate-900" : "text-slate-400"}`}>
                          {label}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {done ? "Completed" : "Waiting for action"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <SectionHeader title="Recent activity" subtitle="Latest movement on your profile" />
                <div className="space-y-3">
                  {recentActivity.map(({ title, desc, time, status, icon: Icon }) => (
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

            <section className="mt-4">
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-950">Personalized recommendation</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Lower the processing risk by submitting one more stable address proof.
                    </p>
                  </div>
                  <button className="flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">
                    Fix now <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
