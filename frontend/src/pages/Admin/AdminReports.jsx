import { useEffect, useMemo, useState } from "react";
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
import { Download, FileText, RefreshCcw, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { getAdminReports } from "../../services/adminAPI";
import { exportApplicationsCsv, formatCurrency, formatStatus } from "../../utils/reportExport";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  pending_admin: "bg-violet-50 text-violet-700 border-violet-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  declined: "bg-red-50 text-red-700 border-red-200",
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

const AdminReports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [purposeFilter, setPurposeFilter] = useState("all");

  const loadReports = async () => {
    setLoading(true);
    setError("");
    try {
      setReport(await getAdminReports());
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const purposes = useMemo(() => {
    const values = new Set((report?.applications || []).map((row) => row.loanPurpose).filter(Boolean));
    return ["all", ...Array.from(values).sort()];
  }, [report]);

  const filteredApplications = useMemo(() => {
    return (report?.applications || []).filter((row) => {
      const statusMatch = statusFilter === "all" || row.status === statusFilter;
      const purposeMatch = purposeFilter === "all" || row.loanPurpose === purposeFilter;
      return statusMatch && purposeMatch;
    });
  }, [report, statusFilter, purposeFilter]);

  const summary = report?.summary || {};

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 rounded-lg bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#43567C]">Reports</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">Platform reports</h1>
          <p className="mt-1 text-sm text-slate-500">
            Filter application data, review officer performance, and export audit reports.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadReports}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
          <button
            onClick={() => exportApplicationsCsv(filteredApplications, "admin-applications-report.csv")}
            disabled={!filteredApplications.length}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#43567C] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total applications" value={loading ? "..." : summary.totalApplications ?? 0} detail="All submissions" icon={FileText} tone="bg-blue-50 text-blue-700" />
        <MetricCard label="Approved" value={loading ? "..." : summary.approved ?? 0} detail={formatCurrency(summary.totalDisbursed)} icon={TrendingUp} tone="bg-emerald-50 text-emerald-700" />
        <MetricCard label="Avg. risk score" value={loading ? "..." : summary.avgRiskScore ?? 0} detail="Across all applications" icon={ShieldCheck} tone="bg-purple-50 text-purple-700" />
        <MetricCard label="Customers assigned" value={loading ? "..." : `${summary.assignedCustomers ?? 0}/${summary.customerCount ?? 0}`} detail={`${summary.unassignedCustomers ?? 0} unassigned`} icon={Users} tone="bg-amber-50 text-amber-700" />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-950">Status breakdown</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={report?.statusBreakdown || []} dataKey="value" innerRadius={50} outerRadius={72} paddingAngle={3}>
                {(report?.statusBreakdown || []).map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-950">Risk breakdown</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={report?.riskBreakdown || []} dataKey="value" innerRadius={50} outerRadius={72} paddingAngle={3}>
                {(report?.riskBreakdown || []).map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-950">Monthly disbursal (Cr)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={report?.disbursalTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="amount" stroke="#43567C" fill="#43567C" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-bold text-slate-950">Officer performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3">Officer</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Pending</th>
                <th className="px-5 py-3">Approved</th>
                <th className="px-5 py-3">Declined</th>
                <th className="px-5 py-3">Sent to admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td className="px-5 py-5 text-slate-500" colSpan="6">Loading...</td></tr>
              ) : (report?.employeePerformance || []).length ? (
                report.employeePerformance.map((row) => (
                  <tr key={row.employeeId}>
                    <td className="px-5 py-4 font-semibold text-slate-900">{row.name}</td>
                    <td className="px-5 py-4">{row.total}</td>
                    <td className="px-5 py-4">{row.pending}</td>
                    <td className="px-5 py-4 text-emerald-700">{row.approved}</td>
                    <td className="px-5 py-4 text-red-700">{row.declined}</td>
                    <td className="px-5 py-4 text-violet-700">{row.escalated}</td>
                  </tr>
                ))
              ) : (
                <tr><td className="px-5 py-5 text-slate-500" colSpan="6">No officer data yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-base font-bold text-slate-950">Application report</h2>
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#43567C]"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="pending_admin">With admin</option>
              <option value="approved">Approved</option>
              <option value="declined">Declined</option>
            </select>
            <select
              value={purposeFilter}
              onChange={(e) => setPurposeFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#43567C]"
            >
              {purposes.map((purpose) => (
                <option key={purpose} value={purpose}>
                  {purpose === "all" ? "All purposes" : purpose}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3">Application</th>
                <th className="px-5 py-3">Applicant</th>
                <th className="px-5 py-3">Purpose</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Risk</th>
                <th className="px-5 py-3">Officer</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td className="px-5 py-5 text-slate-500" colSpan="7">Loading applications...</td></tr>
              ) : filteredApplications.length ? (
                filteredApplications.map((row) => (
                  <tr key={row.applicationId}>
                    <td className="px-5 py-4 font-mono text-xs">{row.applicationId}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">{row.fullName}</td>
                    <td className="px-5 py-4 text-slate-600">{row.loanPurpose}</td>
                    <td className="px-5 py-4 text-slate-600">{formatCurrency(row.loanAmount)}</td>
                    <td className="px-5 py-4">{row.riskScore != null ? `${row.riskScore}/100` : "—"}</td>
                    <td className="px-5 py-4 text-slate-600">{row.officerName}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[row.status] || statusStyles.pending}`}>
                        {formatStatus(row.status)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td className="px-5 py-5 text-slate-500" colSpan="7">No applications match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminReports;
