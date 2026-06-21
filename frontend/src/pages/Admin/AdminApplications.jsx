import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, FileText, RefreshCcw, XCircle } from "lucide-react";
import { getApplications, getEmployees, reviewApplication } from "../../services/adminAPI";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  pending_admin: "bg-violet-50 text-violet-700 border-violet-200",
  under_review: "bg-blue-50 text-blue-700 border-blue-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  declined: "bg-red-50 text-red-700 border-red-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const riskStyles = {
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-red-50 text-red-700 border-red-200",
};

const formatCurrency = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN") : "—";

const formatStatus = (status) =>
  (status || "pending").replaceAll("_", " ");

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState("");
  const [notesById, setNotesById] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const employeeNameById = useMemo(
    () => Object.fromEntries(employees.map((employee) => [employee.id, employee.fullName])),
    [employees]
  );

  const adminQueue = useMemo(
    () => applications.filter((app) => app.status === "pending_admin"),
    [applications]
  );

  const loadData = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const [appRows, employeeRows] = await Promise.all([
        getApplications(),
        getEmployees().catch(() => []),
      ]);
      setApplications(appRows);
      setEmployees(employeeRows);
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to load applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdminReview = async (application, action) => {
    setSubmittingId(application.applicationId);
    setMessage("");
    setError("");

    try {
      const updated = await reviewApplication(application.applicationId, {
        action,
        notes: notesById[application.applicationId] || "",
      });
      setApplications((current) =>
        current.map((row) => (row.applicationId === updated.applicationId ? updated : row))
      );
      setMessage(`Application ${updated.applicationId} ${action === "approve" ? "approved" : "declined"} by admin.`);
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to submit admin review");
    } finally {
      setSubmittingId("");
    }
  };

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 rounded-lg bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#43567C]">Applications</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">All Loan Applications</h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor all submissions and complete final approval for cases escalated by officers.
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <FileText className="text-blue-700" size={20} />
          <p className="mt-3 text-sm text-slate-500">Total Applications</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{applications.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <FileText className="text-amber-700" size={20} />
          <p className="mt-3 text-sm text-slate-500">With officers</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">
            {applications.filter((app) => app.status === "pending").length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <FileText className="text-violet-700" size={20} />
          <p className="mt-3 text-sm text-slate-500">Awaiting admin</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{adminQueue.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <FileText className="text-emerald-700" size={20} />
          <p className="mt-3 text-sm text-slate-500">Approved</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">
            {applications.filter((app) => app.status === "approved").length}
          </p>
        </div>
      </section>

      {(message || error) && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${
          error
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-emerald-200 bg-emerald-50 text-emerald-700"
        }`}>
          {error || message}
        </div>
      )}

      <section className="overflow-hidden rounded-lg border border-violet-200 bg-white shadow-sm">
        <div className="border-b border-violet-100 bg-violet-50 px-5 py-4">
          <h2 className="text-base font-bold text-slate-950">Admin approval queue</h2>
          <p className="mt-1 text-sm text-slate-500">
            Applications escalated by officers. Risk scores are visible here for final decisioning.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3">Applicant</th>
                <th className="px-5 py-3">Application</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Risk score</th>
                <th className="px-5 py-3">Officer</th>
                <th className="px-5 py-3">Notes</th>
                <th className="px-5 py-3">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td className="px-5 py-5 text-slate-500" colSpan="7">Loading admin queue...</td></tr>
              ) : adminQueue.length ? (
                adminQueue.map((app) => (
                  <tr key={app.applicationId}>
                    <td className="px-5 py-4 font-semibold text-slate-900">{app.fullName}</td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-700">{app.applicationId}</td>
                    <td className="px-5 py-4 text-slate-600">{formatCurrency(app.loanAmount)}</td>
                    <td className="px-5 py-4">
                      {app.riskScore != null ? (
                        <div>
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${riskStyles[app.riskLevel] || riskStyles.medium}`}>
                            {app.riskScore}/100
                          </span>
                          {app.riskRecommendation && (
                            <p className="mt-1 text-xs capitalize text-slate-500">{app.riskRecommendation}</p>
                          )}
                        </div>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {app.assignedEmployeeId
                        ? employeeNameById[app.assignedEmployeeId] || app.assignedEmployeeId
                        : "Unassigned"}
                    </td>
                    <td className="px-5 py-4">
                      <textarea
                        value={notesById[app.applicationId] || ""}
                        onChange={(event) =>
                          setNotesById((current) => ({
                            ...current,
                            [app.applicationId]: event.target.value,
                          }))
                        }
                        rows={2}
                        placeholder="Admin notes"
                        className="w-full min-w-44 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#43567C] focus:ring-2 focus:ring-blue-100"
                      />
                      {app.reviewNotes && (
                        <p className="mt-1 text-xs text-slate-400">Officer: {app.reviewNotes}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAdminReview(app, "approve")}
                          disabled={submittingId === app.applicationId}
                          className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                          <CheckCircle2 size={14} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleAdminReview(app, "decline")}
                          disabled={submittingId === app.applicationId}
                          className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                        >
                          <XCircle size={14} />
                          Decline
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td className="px-5 py-5 text-slate-500" colSpan="7">No applications waiting for admin approval.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-bold text-slate-950">All applications</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3">Applicant</th>
                <th className="px-5 py-3">Application ID</th>
                <th className="px-5 py-3">Purpose</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Risk</th>
                <th className="px-5 py-3">Officer</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td className="px-5 py-5 text-slate-500" colSpan="8">Loading applications...</td></tr>
              ) : applications.length ? (
                applications.map((app) => (
                  <tr key={app.applicationId}>
                    <td className="px-5 py-4 font-semibold text-slate-900">{app.fullName}</td>
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-900">{app.applicationId}</td>
                    <td className="px-5 py-4 text-slate-600">{app.loanPurpose}</td>
                    <td className="px-5 py-4 text-slate-600">{formatCurrency(app.loanAmount)}</td>
                    <td className="px-5 py-4">
                      {app.riskScore != null ? (
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${riskStyles[app.riskLevel] || riskStyles.medium}`}>
                          {app.riskScore}/100
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {app.assignedEmployeeId
                        ? employeeNameById[app.assignedEmployeeId] || app.assignedEmployeeId
                        : "Unassigned"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[app.status] || statusStyles.pending}`}>
                        {formatStatus(app.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500">{formatDate(app.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr><td className="px-5 py-5 text-slate-500" colSpan="8">No applications submitted yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminApplications;
