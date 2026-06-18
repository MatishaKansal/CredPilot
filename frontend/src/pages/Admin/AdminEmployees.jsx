import { useEffect, useState } from "react";
import { Pencil, Plus, RefreshCcw, ShieldCheck, Trash2, UserRoundPlus, Users } from "lucide-react";
import { createEmployee, deleteEmployee, getEmployees, updateEmployee } from "../../services/adminAPI";

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  role: "officer",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

const emptyEditForm = {
  id: "",
  fullName: "",
  email: "",
  phone: "",
  role: "officer",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

const AdminEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadEmployees = async () => {
    setLoading(true);
    setError("");
    try {
      setEmployees(await getEmployees());
    } catch {
      setError("Unable to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const employee = await createEmployee(form);
      setEmployees((current) => [...current, employee]);
      setForm(emptyForm);
      setMessage(`${employee.fullName} added successfully`);
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to add employee/admin");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (employee) => {
    setEditingId(employee.id);
    setEditForm({ ...emptyEditForm, ...employee });
    setMessage("");
    setError("");
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    setUpdating(true);
    setMessage("");
    setError("");

    try {
      const { email, id, phone, ...editableEmployee } = editForm;
      const updated = await updateEmployee(editingId, editableEmployee);
      setEmployees((current) =>
        current.map((employee) => employee.id === editingId ? updated : employee)
      );
      setEditingId("");
      setEditForm(emptyEditForm);
      setMessage(`${updated.fullName} updated successfully`);
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to update employee/admin");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (employee) => {
    const confirmed = window.confirm(`Delete ${employee.fullName}?`);
    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      await deleteEmployee(employee.id);
      setEmployees((current) => current.filter((row) => row.id !== employee.id));
      setMessage(`${employee.fullName} deleted successfully`);
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to delete employee/admin");
    }
  };

  const officers = employees.filter((employee) => employee.role === "officer").length;
  const admins = employees.filter((employee) => employee.role === "admin").length;

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 rounded-lg bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#43567C]">Employees</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">Team directory</h1>
          <p className="mt-1 text-sm text-slate-500">
            View employee details and add new employees or admins.
          </p>
        </div>
        <button
          onClick={loadEmployees}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <Users className="text-blue-700" size={20} />
          <p className="mt-3 text-sm text-slate-500">Total staff</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{employees.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <UserRoundPlus className="text-emerald-700" size={20} />
          <p className="mt-3 text-sm text-slate-500">Employees</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{officers}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <ShieldCheck className="text-purple-700" size={20} />
          <p className="mt-3 text-sm text-slate-500">Admins</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{admins}</p>
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

      <section className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-bold text-slate-950">Employee list</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Employee ID</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td className="px-5 py-5 text-slate-500" colSpan="6">Loading employees...</td></tr>
                ) : employees.length ? (
                  employees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="px-5 py-4 font-semibold text-slate-900">{employee.fullName}</td>
                      <td className="px-5 py-4 text-slate-600">{employee.email}</td>
                      <td className="px-5 py-4 text-slate-600">{employee.phone || "-"}</td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
                          {employee.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-500">{employee.id}</td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(employee)}
                            className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <Pencil size={13} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(employee)}
                            className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={13} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td className="px-5 py-5 text-slate-500" colSpan="6">No employees found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Plus size={18} className="text-[#43567C]" />
            <h2 className="text-base font-bold text-slate-950">Add employee/admin</h2>
          </div>

          <div className="grid gap-3">
            {[
              ["fullName", "Full name", "text"],
              ["email", "Email", "email"],
              ["phone", "Phone", "tel"],
              ["password", "Temporary password", "password"],
              ["address", "Address", "text"],
              ["city", "City", "text"],
              ["state", "State", "text"],
              ["pincode", "Pincode", "text"],
            ].map(([name, label, type]) => (
              <label key={name} className="block">
                <span className="text-xs font-semibold text-slate-500">{label}</span>
                <input
                  required
                  type={type}
                  value={form[name]}
                  onChange={(event) => setForm({ ...form, [name]: event.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#43567C] focus:ring-2 focus:ring-blue-100"
                />
              </label>
            ))}
          </div>

          <label className="mb-4 mt-3 block">
            <span className="text-xs font-semibold text-slate-500">Role</span>
            <select
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#43567C] focus:ring-2 focus:ring-blue-100"
            >
              <option value="officer">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <button
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#43567C] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
          >
            <Plus size={16} />
            {saving ? "Adding..." : "Add staff member"}
          </button>
        </form>
      </section>

      {editingId && (
        <form onSubmit={handleUpdate} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-950">Edit employee/admin details</h2>
              <p className="mt-1 text-sm text-slate-500">Fill missing DB columns for the selected staff member.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingId("");
                setEditForm(emptyEditForm);
              }}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["id", "Employee/Admin ID"],
              ["email", "Email"],
              ["phone", "Phone"],
            ].map(([name, label]) => (
              <label key={name}>
                <span className="text-xs font-semibold text-slate-500">{label}</span>
                <input
                  disabled
                  value={editForm[name] || ""}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-500 outline-none"
                />
              </label>
            ))}

            {[
              ["fullName", "Full name", "text"],
              ["city", "City", "text"],
              ["state", "State", "text"],
              ["pincode", "Pincode", "text"],
            ].map(([name, label, type]) => (
              <label key={name}>
                <span className="text-xs font-semibold text-slate-500">{label}</span>
                <input
                  required
                  type={type}
                  value={editForm[name] || ""}
                  onChange={(event) => setEditForm({ ...editForm, [name]: event.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#43567C] focus:ring-2 focus:ring-blue-100"
                />
              </label>
            ))}

            <label>
              <span className="text-xs font-semibold text-slate-500">Role</span>
              <select
                value={editForm.role}
                onChange={(event) => setEditForm({ ...editForm, role: event.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#43567C] focus:ring-2 focus:ring-blue-100"
              >
                <option value="officer">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <label className="md:col-span-3">
              <span className="text-xs font-semibold text-slate-500">Address</span>
              <input
                required
                value={editForm.address || ""}
                onChange={(event) => setEditForm({ ...editForm, address: event.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#43567C] focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>

          <button
            disabled={updating}
            className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-[#43567C] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
          >
            <Pencil size={16} />
            {updating ? "Saving..." : "Save changes"}
          </button>
        </form>
      )}
    </div>
  );
};

export default AdminEmployees;
