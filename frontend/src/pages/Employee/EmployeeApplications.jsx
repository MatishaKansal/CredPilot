import { useEffect, useState } from "react";
import { RefreshCcw, FileText } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  under_review: "bg-blue-50 text-blue-700 border-blue-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const formatCurrency = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN") : "—";

const EmployeeApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadApplications = async () => {
    if (!user?.user_id) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:8000/employee/${user.user_id}/applications`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to load");
      setApplications(data.applications || []);
    } catch (err) {
      setError(err.message || "Unable to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [user?.user_id]);

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 rounded-lg bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#43567C]">Applications</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">Assigned Customer Applications</h1>
          <p className="mt-1 text-sm text-slate-500">
            Loan applications from customers assigned to you by the admin.
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

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <FileText className="text-blue-700" size={20} />
          <p className="mt-3 text-sm text-slate-500">Total Applications</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{applications.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <FileText className="text-amber-700" size={20} />
          <p className="mt-3 text-sm text-slate-500">Pending Review</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">
            {applications.filter((app) => app.status === "pending").length}
          </p>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-bold text-slate-950">Review queue</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3">Applicant</th>
                <th className="px-5 py-3">Application ID</th>
                <th className="px-5 py-3">Purpose</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Tenure</th>
                <th className="px-5 py-3">Employment</th>
                <th className="px-5 py-3">Submitted</th>
                <th className="px-5 py-3">Status</th>
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
                    <td className="px-5 py-4 text-slate-600">{app.tenureMonths} mo</td>
                    <td className="px-5 py-4 text-slate-600">{app.employmentType}</td>
                    <td className="px-5 py-4 text-slate-500">{formatDate(app.createdAt)}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[app.status] || statusStyles.pending}`}>
                        {(app.status || "pending").replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-5 py-5 text-slate-500" colSpan="8">
                    No applications assigned to you yet. Ask admin to assign applications from the Applications page.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default EmployeeApplications;
