import { useEffect, useMemo, useState } from "react";
import { RefreshCcw, UserCheck, Users } from "lucide-react";
import { assignCustomer, getCustomers, getEmployees } from "../../services/adminAPI";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingCustomerId, setSavingCustomerId] = useState("");
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
    try {
      const customerRows = await getCustomers();
      setCustomers(customerRows);
      setAssignments(
        Object.fromEntries(
          customerRows.map((customer) => [
            customer.userId,
            customer.assignedEmployeeId || "",
          ])
        )
      );
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to load customers. Check backend and database connection.");
    }

    try {
      setEmployees(await getEmployees());
    } catch {
      setEmployees([]);
      setError((current) => current || "Customers loaded, but employees could not be loaded for assignment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssign = async (customer) => {
    const employeeId = assignments[customer.userId];
    if (!employeeId) {
      setError("Select an employee before assigning");
      return;
    }

    setSavingCustomerId(customer.userId);
    setMessage("");
    setError("");

    try {
      const updated = await assignCustomer(customer.userId, employeeId);
      setCustomers((current) =>
        current.map((row) => row.userId === updated.userId ? updated : row)
      );
      setMessage(`${customer.fullName} assigned to ${employeeNameById[employeeId]}`);
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to assign customer");
    } finally {
      setSavingCustomerId("");
    }
  };

  const assignedCount = customers.filter((customer) => customer.assignedEmployeeId).length;

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 rounded-lg bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#43567C]">Customers</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">Customer assignments</h1>
          <p className="mt-1 text-sm text-slate-500">
            View customer details and assign applicants to employees.
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
          <Users className="text-blue-700" size={20} />
          <p className="mt-3 text-sm text-slate-500">Total customers</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{customers.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <UserCheck className="text-emerald-700" size={20} />
          <p className="mt-3 text-sm text-slate-500">Assigned customers</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{assignedCount}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <Users className="text-amber-700" size={20} />
          <p className="mt-3 text-sm text-slate-500">Available employees</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{officers.length}</p>
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
          <h2 className="text-base font-bold text-slate-950">Customer list</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Assigned employee</th>
                <th className="px-5 py-3">Assign customer</th>
                <th className="px-5 py-3">Customer ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td className="px-5 py-5 text-slate-500" colSpan="6">Loading customers...</td></tr>
              ) : customers.length ? (
                customers.map((customer) => (
                  <tr key={customer.userId}>
                    <td className="px-5 py-4 font-semibold text-slate-900">{customer.fullName}</td>
                    <td className="px-5 py-4 text-slate-600">{customer.email}</td>
                    <td className="px-5 py-4 text-slate-600">{customer.phone || "-"}</td>
                    <td className="px-5 py-4 text-slate-600">
                      {customer.assignedEmployeeId
                        ? employeeNameById[customer.assignedEmployeeId] || customer.assignedEmployeeId
                        : "Unassigned"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <select
                          value={assignments[customer.userId] || ""}
                          onChange={(event) =>
                            setAssignments({
                              ...assignments,
                              [customer.userId]: event.target.value,
                            })
                          }
                          className="min-w-44 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#43567C] focus:ring-2 focus:ring-blue-100"
                        >
                          <option value="">Select employee</option>
                          {officers.map((employee) => (
                            <option key={employee.id} value={employee.id}>
                              {employee.fullName}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAssign(customer)}
                          disabled={savingCustomerId === customer.userId}
                          className="rounded-lg bg-[#43567C] px-3 py-2 text-xs font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
                        >
                          {savingCustomerId === customer.userId ? "Saving" : "Assign"}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">{customer.userId}</td>
                  </tr>
                ))
              ) : (
                <tr><td className="px-5 py-5 text-slate-500" colSpan="6">No customers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminCustomers;
