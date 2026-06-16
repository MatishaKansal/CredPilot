import {
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  FileText, ShieldCheck, Clock, CheckCircle2,
  ArrowRight, TrendingUp, AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ─── mock data ───────────────────────────────────────── */

const riskTrend = [
  { month: "Jan", score: 58 },
  { month: "Feb", score: 63 },
  { month: "Mar", score: 61 },
  { month: "Apr", score: 67 },
  { month: "May", score: 72 },
  { month: "Jun", score: 70 },
];

const loanActivity = [
  { month: "Jan", amount: 0 },
  { month: "Feb", amount: 50000 },
  { month: "Mar", amount: 50000 },
  { month: "Apr", amount: 120000 },
  { month: "May", amount: 120000 },
  { month: "Jun", amount: 200000 },
];

const recentActivity = [
  {
    id: 1,
    title: "Loan application submitted",
    desc: "Home Loan — ₹20,00,000",
    time: "2 hours ago",
    status: "pending",
    icon: FileText,
  },
  {
    id: 2,
    title: "Eligibility check completed",
    desc: "Risk score: 72 / 100",
    time: "Yesterday",
    status: "warning",
    icon: ShieldCheck,
  },
  {
    id: 3,
    title: "Documents uploaded",
    desc: "Aadhaar, PAN, salary slips",
    time: "2 days ago",
    status: "success",
    icon: CheckCircle2,
  },
  {
    id: 4,
    title: "Loan under review",
    desc: "Officer assigned: Priya Sharma",
    time: "3 days ago",
    status: "info",
    icon: Clock,
  },
];

/* ─── helpers ─────────────────────────────────────────── */

const statusStyles = {
  pending: "bg-amber-50  text-amber-600  border-amber-100",
  warning: "bg-orange-50 text-orange-600 border-orange-100",
  success: "bg-emerald-50 text-emerald-600 border-emerald-100",
  info:    "bg-blue-50   text-[#1565C0]  border-blue-100",
};

const StatCard = ({ label, value, sub, icon: Icon, accent }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</span>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon size={16} className="text-white" />
      </div>
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label, prefix = "" }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 text-xs shadow-sm">
        <p className="text-gray-400 mb-0.5">{label}</p>
        <p className="font-semibold text-gray-900">
          {prefix}{payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

/* ─── main component ──────────────────────────────────── */

const UserDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Good morning, Rahul 👋</h1>
          <p className="text-sm text-gray-400 mt-0.5">Here's what's happening with your loans.</p>
        </div>
        <button
          onClick={() => navigate("/user/apply-loan")}
          className="hidden md:flex items-center gap-2 bg-[#1565C0] hover:bg-[#1a237e] text-white text-sm font-semibold px-4 py-2.5 rounded-2xl transition-all"
        >
          Apply for Loan <ArrowRight size={15} />
        </button>
      </div>

      {/* ── Stat cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Loans"
          value="1"
          sub="Home loan — under review"
          icon={FileText}
          accent="bg-[#1565C0]"
        />
        <StatCard
          label="Risk Score"
          value="72"
          sub="Moderate risk"
          icon={AlertCircle}
          accent="bg-amber-500"
        />
        <StatCard
          label="Loan Amount"
          value="₹20L"
          sub="Applied this month"
          icon={TrendingUp}
          accent="bg-emerald-500"
        />
        <StatCard
          label="Docs Uploaded"
          value="3 / 5"
          sub="2 more required"
          icon={CheckCircle2}
          accent="bg-purple-500"
        />
      </div>

      {/* ── Charts row ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Risk score trend */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">Risk score trend</p>
              <p className="text-xs text-gray-400">Last 6 months</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 font-medium">
              72 this month
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={riskTrend} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1565C0" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1565C0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#1565C0"
                strokeWidth={2}
                fill="url(#riskGrad)"
                dot={{ r: 3, fill: "#1565C0", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#1565C0" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Loan amount over time */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">Loan amount applied</p>
              <p className="text-xs text-gray-400">Cumulative (₹)</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-[#1565C0] border border-blue-100 font-medium">
              ₹2,00,000 total
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={loanActivity} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false}
                tickFormatter={(v) => v === 0 ? "0" : `₹${v / 1000}K`} />
              <Tooltip content={<CustomTooltip prefix="₹" />} />
              <Bar dataKey="amount" fill="#1565C0" radius={[6, 6, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* ── Bottom row ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent activity */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-900">Recent activity</p>
            <button className="text-xs text-[#1565C0] font-medium hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {recentActivity.map(({ id, title, desc, time, status, icon: Icon }) => (
              <div key={id} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${statusStyles[status]}`}>
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{title}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
                <span className="text-xs text-gray-300 shrink-0 mt-0.5">{time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Loan status snapshot */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-4">
          <p className="text-sm font-semibold text-gray-900">Loan status</p>

          <div className="flex flex-col gap-2">
            {[
              { label: "Application",  done: true  },
              { label: "Documents",    done: true  },
              { label: "Verification", done: false },
              { label: "Approval",     done: false },
              { label: "Disbursal",    done: false },
            ].map(({ label, done }, i, arr) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    done ? "bg-[#1565C0] border-[#1565C0]" : "bg-white border-gray-200"
                  }`}>
                    {done && <CheckCircle2 size={11} className="text-white" />}
                  </div>
                  {i < arr.length - 1 && (
                    <div className={`w-px h-5 ${done ? "bg-[#1565C0]" : "bg-gray-200"}`} />
                  )}
                </div>
                <span className={`text-xs font-medium ${done ? "text-gray-800" : "text-gray-400"}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400">Current stage</p>
            <p className="text-sm font-semibold text-amber-600 mt-0.5">Document Verification</p>
            <p className="text-xs text-gray-400 mt-0.5">Est. 2–3 business days</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserDashboard;