import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
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
  Search,
  ShieldCheck,
  TrendingUp,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getStoredUserDetailsComplete } from "../../utils/userDetails";

const iconMap = {
  CheckCircle2,
  User,
  TrendingUp,
  AlertCircle,
  FileText,
  Clock,
};

const defaultRequiredDocuments = [
  "Government ID proof",
  "Income proof",
  "Address proof",
  "Loan purpose proof (if applicable)",
];

const documentLabel = (item) => (typeof item === "string" ? item : item.title);

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

const formatRs = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

const formatEmi = (value) =>
  `Rs. ${(Number(value || 0) / 1000).toFixed(1)}K`;

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.user_id) return;
    setLoading(true);
    fetch(`http://localhost:8000/applicant/${user.user_id}/dashboard`)
      .then((res) => res.json())
      .then((data) => setDashData(data))
      .catch(() => setDashData(null))
      .finally(() => setLoading(false));
  }, [user?.user_id]);

  const firstName = (dashData?.applicant?.fullName || user?.name || "").split(" ")[0];
  const hero = dashData?.hero || {};
  const metrics = dashData?.metrics || {};
  const riskTrend = dashData?.applicationTrend?.length
    ? dashData.applicationTrend
    : [{ month: "—", score: 50 }];
  const requiredDocuments = dashData?.requiredDocuments?.length
    ? dashData.requiredDocuments
    : defaultRequiredDocuments;
  const timeline = dashData?.timeline || [];
  const recentActivity = (dashData?.recentActivity || []).map((item) => ({
    ...item,
    icon: iconMap[item.iconKey] || FileText,
  }));
  const recommendation = dashData?.recommendation || {
    title: "Complete your profile",
    desc: "Add profile details to speed up loan review.",
  };
  const readiness = hero.readinessPercent ?? 0;
  const loanAmount = hero.headlineAmount ?? 0;

  const handleApplyLoan = () => {
    if (!getStoredUserDetailsComplete()) {
      navigate("/user/profile");
      return;
    }
    navigate("/user/apply-loan");
  };

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-white/70 bg-white/85 px-4 py-4 backdrop-blur md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#43567C]">Welcome back, {firstName || "Applicant"}</p>
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
              onClick={handleApplyLoan}
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
                    {hero.statusLabel || "Verification in progress"}
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100">
                    Application ID {hero.applicationId || "—"}
                  </span>
                </div>

                <p className="text-sm text-blue-100">{hero.loanPurpose || "Loan application"}</p>
                <h2 className="mt-2 max-w-xl text-3xl font-bold leading-tight">
                  {loanAmount
                    ? `${formatRs(loanAmount)} request is ${readiness}% complete`
                    : "Start your first loan application"}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-blue-100">
                  {recommendation.desc}
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    ["Expected EMI", loanAmount ? formatEmi(hero.estimatedEmi) : "—"],
                    ["Tenure", hero.tenureLabel || "—"],
                    ["Review date", hero.reviewDate || "—"],
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
                  <span className="text-2xl font-bold">{readiness}</span>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: `${readiness}%` }} />
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    ["Credit history", hero.creditHistory || "—"],
                    ["Income stability", hero.incomeStability || "—"],
                    ["Profile completeness", hero.profileCompleteness || hero.documentHealth || "—"],
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
            value={loading ? "..." : String(metrics.activeLoans ?? 0)}
            detail={dashData?.latestApplication?.loanPurpose || "No active application"}
            icon={FileText}
            tone="bg-blue-50 text-blue-700"
          />
          <MetricCard
            label="Risk score"
            value={loading ? "..." : String(metrics.profileScore ?? 0)}
            detail={metrics.profileScoreDetail || "Profile completion score"}
            icon={ShieldCheck}
            tone="bg-emerald-50 text-emerald-700"
          />
          <MetricCard
            label="Profile fields"
            value={loading ? "..." : metrics.profileFieldsComplete || metrics.docsUploaded || "0 / 5"}
            detail={metrics.profileFieldsDetail || metrics.docsDetail || "Profile fields completed"}
            icon={User}
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
            <SectionHeader title="Required documents" />
            <ul className="space-y-2">
              {requiredDocuments.map((item) => (
                <li key={documentLabel(item)} className="text-sm font-medium text-slate-800">
                  • {documentLabel(item)}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <SectionHeader title="Application timeline" subtitle="Where your loan stands right now" action="View all" />
            <div className="space-y-4">
              {(timeline.length ? timeline : [{ label: "Application submitted", done: false }]).map(({ label, done }, index, arr) => (
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
              {recentActivity.length ? recentActivity.map(({ title, desc, time, status, icon: Icon }) => (
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
              )) : (
                <p className="text-sm text-slate-500">No recent activity yet.</p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-950">{recommendation.title}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {recommendation.desc}
                </p>
              </div>
              <button
                onClick={() => navigate("/user/profile")}
                className="flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Fix now <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default UserDashboard;
