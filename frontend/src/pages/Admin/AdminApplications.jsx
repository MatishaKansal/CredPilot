import { useEffect, useMemo, useState } from "react";
import { RefreshCcw, FileText } from "lucide-react";
import { assignApplication, getApplications, getEmployees } from "../../services/adminAPI";

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

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingApplicationId, setSavingApplicationId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const officers = useMemo(
    () => employees.filter((employee) => employee.role === "officer"),
    [employees]
  );

  const employeeNameById = useMemo(
    () => Object.fromEntries(employees.map((employee) => [employee.id, employee.fullName])),
    [employees]
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
      setAssignments(
        Object.fromEntries(
          appRows.map((app) => [app.applicationId, app.assignedEmployeeId || ""])
        )
      );
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to load applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssign = async (application) => {
    const employeeId = assignments[application.applicationId];
    if (!employeeId) {
      setError("Select an officer before assigning");
      return;
    }
    if (employeeId === application.assignedEmployeeId) {
      setError("This application is already assigned to the selected officer");
      return;
    }

    setSavingApplicationId(application.applicationId);
    setMessage("");
    setError("");

    try {
      const updated = await assignApplication(application.applicationId, employeeId);
      setApplications((current) =>
        current.map((row) =>
          row.applicationId === updated.applicationId ? updated : row
        )
      );
      setMessage(
        `${application.applicationId} assigned to ${employeeNameById[employeeId]}`
      );
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to assign application");
    } finally {
      setSavingApplicationId("");
    }
  };

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 rounded-lg bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#43567C]">Applications</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">All Loan Applications</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review submissions and assign each application to an officer individually.
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

      <section className="grid gap-4 md:grid-cols-3">
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
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <FileText className="text-emerald-700" size={20} />
          <p className="mt-3 text-sm text-slate-500">Assigned Applications</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">
            {applications.filter((app) => app.assignedEmployeeId).length}
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
          <h2 className="text-base font-bold text-slate-950">Application Queue</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3">Applicant</th>
                <th className="px-5 py-3">Application ID</th>
                <th className="px-5 py-3">Purpose</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Tenure</th>
                <th className="px-5 py-3">Submitted</th>
                <th className="px-5 py-3">Assign officer</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td className="px-5 py-5 text-slate-500" colSpan="8">Loading applications...</td></tr>
              ) : applications.length ? (
                applications.map((app) => {
                  const isAssigned = Boolean(app.assignedEmployeeId);
                  const isUnchanged = assignments[app.applicationId] === app.assignedEmployeeId;

                  return (
                    <tr key={app.applicationId}>
                      <td className="px-5 py-4 font-semibold text-slate-900">{app.fullName}</td>
                      <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-900">{app.applicationId}</td>
                      <td className="px-5 py-4 text-slate-600">{app.loanPurpose}</td>
                      <td className="px-5 py-4 text-slate-600">{formatCurrency(app.loanAmount)}</td>
                      <td className="px-5 py-4 text-slate-600">{app.tenureMonths} mo</td>
                      <td className="px-5 py-4 text-slate-500">{formatDate(app.createdAt)}</td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <select
                            value={assignments[app.applicationId] || ""}
                            onChange={(event) =>
                              setAssignments({
                                ...assignments,
                                [app.applicationId]: event.target.value,
                              })
                            }
                            className="min-w-44 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#43567C] focus:ring-2 focus:ring-blue-100"
                          >
                            <option value="">Select officer</option>
                            {officers.map((employee) => (
                              <option key={employee.id} value={employee.id}>
                                {employee.fullName}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleAssign(app)}
                            disabled={
                              savingApplicationId === app.applicationId
                              || !assignments[app.applicationId]
                              || isUnchanged
                            }
                            className="rounded-lg bg-[#43567C] px-3 py-2 text-xs font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
                          >
                            {savingApplicationId === app.applicationId
                              ? "Saving"
                              : isAssigned
                                ? "Reassign"
                                : "Assign"}
                          </button>
                        </div>
                        {isAssigned && (
                          <p className="mt-1 text-xs text-slate-400">
                            Current: {employeeNameById[app.assignedEmployeeId] || app.assignedEmployeeId}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[app.status] || statusStyles.pending}`}>
                          {(app.status || "pending").replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  );
                })
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
