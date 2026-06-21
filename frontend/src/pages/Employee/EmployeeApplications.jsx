import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2, RefreshCcw, Send, ShieldAlert, XCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getEmployeeApplications,
  reviewEmployeeApplication,
} from "../../services/employeeAPI";

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

const getErrorMessage = (err, fallback) => {
  const detail = err?.response?.data?.detail;

  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg || item.message || JSON.stringify(item)).join(", ");
  }
  if (detail) return JSON.stringify(detail);

  return err?.message || fallback;
};

const DetailRow = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
    <p className="mt-1 text-sm font-medium text-slate-800">{value || "—"}</p>
  </div>
);

const openApplication = (app, setSelectedId, setNotes, setMessage, setError) => {
  setSelectedId(app.applicationId);
  setNotes("");
  setMessage("");
  setError("");
};

const EmployeeApplications = () => {
  const { user } = useAuth();
  const detailRef = useRef(null);
  const [applications, setApplications] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selected = useMemo(
    () => applications.find((app) => app.applicationId === selectedId) || null,
    [applications, selectedId]
  );

  const pendingApplications = useMemo(
    () => applications.filter((app) => app.status === "pending"),
    [applications]
  );

  const loadApplications = async () => {
    if (!user?.user_id) return;
    setLoading(true);
    setError("");
    try {
      const rows = await getEmployeeApplications(user.user_id);
      setApplications(rows);
      if (selectedId && !rows.some((row) => row.applicationId === selectedId)) {
        setSelectedId("");
        setNotes("");
      }
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [user?.user_id]);

  useEffect(() => {
    if (selectedId && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedId]);

  const handleOpenApplication = (app) => {
    openApplication(app, setSelectedId, setNotes, setMessage, setError);
  };

  const handleReview = async (action) => {
    if (!selected || !user?.user_id) return;

    setSubmitting(action);
    setMessage("");
    setError("");

    try {
      const updated = await reviewEmployeeApplication(user.user_id, selected.applicationId, {
        action,
        notes,
      });
      setApplications((current) =>
        current.map((row) => (row.applicationId === updated.applicationId ? updated : row))
      );
      setSelectedId("");
      setNotes("");
      setMessage(`Application ${updated.applicationId} marked as ${formatStatus(updated.status)}.`);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to submit review"));
    } finally {
      setSubmitting("");
    }
  };

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 rounded-lg bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#43567C]">Review portal</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">Application reviews</h1>
          <p className="mt-1 text-sm text-slate-500">
            Open an application to review details, risk score, and accept, decline, or send to admin.
          </p>
        </div>
        <button
          onClick={loadApplications}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <ShieldAlert className="text-amber-700" size={20} />
          <p className="mt-3 text-sm text-slate-500">Awaiting review</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{pendingApplications.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <CheckCircle2 className="text-emerald-700" size={20} />
          <p className="mt-3 text-sm text-slate-500">Accepted by you</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">
            {applications.filter((app) => app.status === "approved").length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <Send className="text-violet-700" size={20} />
          <p className="mt-3 text-sm text-slate-500">Sent to admin</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">
            {applications.filter((app) => app.status === "pending_admin").length}
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

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-bold text-slate-950">Review queue</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3">Applicant</th>
                <th className="px-5 py-3">Application</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Risk</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td className="px-5 py-5 text-slate-500" colSpan="5">Loading applications...</td></tr>
              ) : applications.length ? (
                applications.map((app) => (
                  <tr key={app.applicationId} className={selectedId === app.applicationId ? "bg-blue-50/40" : ""}>
                    <td className="px-5 py-4 font-semibold text-slate-900">{app.fullName}</td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-700">{app.applicationId}</td>
                    <td className="px-5 py-4 text-slate-600">{formatCurrency(app.loanAmount)}</td>
                    <td className="px-5 py-4">
                      {app.riskScore != null ? (
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${riskStyles[app.riskLevel] || riskStyles.medium}`}>
                          {app.riskScore}/100
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-4">
                      {app.status === "pending" ? (
                        <button
                          onClick={() => handleOpenApplication(app)}
                          className="rounded-lg bg-[#43567C] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-900"
                        >
                          Go to application
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[app.status] || statusStyles.pending}`}>
                            {formatStatus(app.status)}
                          </span>
                          <button
                            onClick={() => handleOpenApplication(app)}
                            className="text-xs font-semibold text-[#43567C] hover:text-blue-900"
                          >
                            View
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-5 py-5 text-slate-500" colSpan="5">
                    No applications yet. Ask admin to assign customers to you from the Customers page.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selected && (
        <section ref={detailRef} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#43567C]">Application review</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">{selected.fullName}</h2>
              <p className="mt-1 font-mono text-xs text-slate-500">{selected.applicationId}</p>
            </div>
            <button
              onClick={() => setSelectedId("")}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft size={14} />
              Back to queue
            </button>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">AI risk score</p>
                  <p className="mt-1 text-3xl font-bold text-slate-950">
                    {selected.riskScore != null ? `${selected.riskScore}/100` : "—"}
                  </p>
                </div>
                {selected.riskLevel && (
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${riskStyles[selected.riskLevel] || riskStyles.medium}`}>
                    {selected.riskLevel} risk
                  </span>
                )}
              </div>
              {selected.riskRecommendation && (
                <p className="mt-3 text-sm text-slate-600">
                  Model recommendation:
                  <span className="ml-1 font-semibold capitalize text-slate-900">
                    {selected.riskRecommendation}
                  </span>
                </p>
              )}
              {selected.riskFactors?.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Key drivers</p>
                  {selected.riskFactors.map((factor) => (
                    <div key={factor.feature} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm">
                      <span className="text-slate-700">{factor.feature}</span>
                      <span className={`text-xs font-semibold capitalize ${
                        factor.direction === "positive" ? "text-emerald-700" : "text-red-700"
                      }`}>
                        {factor.impact} {factor.direction}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailRow label="Loan purpose" value={selected.loanPurpose} />
                <DetailRow label="Loan amount" value={formatCurrency(selected.loanAmount)} />
                <DetailRow label="Tenure" value={`${selected.tenureMonths} months`} />
                <DetailRow label="Monthly income" value={formatCurrency(selected.monthlyIncome)} />
                <DetailRow label="Employment" value={selected.employmentType} />
                <DetailRow label="Years employed" value={selected.yearsEmployed} />
                <DetailRow label="Region" value={selected.regionType} />
                <DetailRow label="Education" value={selected.educationLevel} />
                <DetailRow label="Marital status" value={selected.maritalStatus} />
                <DetailRow label="Past loans" value={selected.hasPastLoans ? `Yes (${selected.numPastLoans})` : "No"} />
                <DetailRow label="Late payments" value={selected.hadLatePayments ? "Yes" : "No"} />
                <DetailRow label="Submitted" value={formatDate(selected.createdAt)} />
              </div>

              {selected.status === "pending" ? (
                <>
                  <label>
                    <span className="text-xs font-semibold text-slate-500">Review notes</span>
                    <textarea
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      rows={3}
                      placeholder="Optional notes for audit trail"
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#43567C] focus:ring-2 focus:ring-blue-100"
                    />
                  </label>

                  <div className="grid gap-2 sm:grid-cols-3">
                    <button
                      onClick={() => handleReview("approve")}
                      disabled={Boolean(submitting)}
                      className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      <CheckCircle2 size={16} />
                      {submitting === "approve" ? "Saving..." : "Accept"}
                    </button>
                    <button
                      onClick={() => handleReview("decline")}
                      disabled={Boolean(submitting)}
                      className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                    >
                      <XCircle size={16} />
                      {submitting === "decline" ? "Saving..." : "Decline"}
                    </button>
                    <button
                      onClick={() => handleReview("escalate")}
                      disabled={Boolean(submitting)}
                      className="flex items-center justify-center gap-2 rounded-lg bg-[#43567C] px-3 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
                    >
                      <Send size={16} />
                      {submitting === "escalate" ? "Saving..." : "Go to admin"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  This application is already <span className="font-semibold capitalize">{formatStatus(selected.status)}</span>.
                  {selected.reviewNotes ? ` Notes: ${selected.reviewNotes}` : ""}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {!selected && !loading && applications.length > 0 && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 bg-white px-4 py-8 text-sm text-slate-500">
          <AlertTriangle size={16} className="text-slate-300" />
          Click <span className="font-semibold text-[#43567C]">Go to application</span> on a pending row to start review.
        </div>
      )}
    </div>
  );
};

export default EmployeeApplications;
