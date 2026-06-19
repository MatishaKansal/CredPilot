import { useEffect, useState } from "react";
import { RefreshCcw, UserCheck, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const EmployeeCustomers = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCustomers = async () => {
    if (!user?.user_id) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:8000/employee/${user.user_id}/customers`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to load");
      setCustomers(data.customers || []);
    } catch (err) {
      setError(err.message || "Unable to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [user?.user_id]);

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 rounded-lg bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#43567C]">Customers</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">My assigned customers</h1>
          <p className="mt-1 text-sm text-slate-500">
            Customers currently assigned to you by the admin.
          </p>
        </div>
        <button
          onClick={loadCustomers}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <Users className="text-blue-700" size={20} />
          <p className="mt-3 text-sm text-slate-500">Total assigned</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{customers.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <UserCheck className="text-emerald-700" size={20} />
          <p className="mt-3 text-sm text-slate-500">With phone number</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">
            {customers.filter((c) => c.phone).length}
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
          <h2 className="text-base font-bold text-slate-950">Customer list</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Customer ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td className="px-5 py-5 text-slate-500" colSpan="4">Loading customers...</td></tr>
              ) : customers.length ? (
                customers.map((customer) => (
                  <tr key={customer.userId}>
                    <td className="px-5 py-4 font-semibold text-slate-900">{customer.fullName}</td>
                    <td className="px-5 py-4 text-slate-600">{customer.email}</td>
                    <td className="px-5 py-4 text-slate-600">{customer.phone || "-"}</td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">{customer.userId}</td>
                  </tr>
                ))
              ) : (
                <tr><td className="px-5 py-5 text-slate-500" colSpan="4">No customers assigned yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default EmployeeCustomers;
