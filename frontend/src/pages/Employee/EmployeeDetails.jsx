import { useEffect, useState } from "react";
import { Save, UserCog } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  isEmployeeDetailsComplete,
  setStoredEmployeeDetailsComplete,
} from "../../utils/employeeDetails";

const emptyDetails = {
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

const getErrorMessage = (err, fallback) => {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((item) => item.msg || item.message || JSON.stringify(item)).join(", ");
  if (detail) return JSON.stringify(detail);
  return err?.message || fallback;
};

const EmployeeDetails = () => {
  const { user, login } = useAuth();
  const [details, setDetails] = useState({
    ...emptyDetails,
    fullName: user?.name || "",
    email: user?.email || "",
    role: user?.role || "officer",
  });
  const [loading, setLoading] = useState(Boolean(user?.user_id));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDetails = async () => {
      if (!user?.user_id) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`http://localhost:8000/admin/employees/${user.user_id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Failed to load");
        setDetails({ ...emptyDetails, ...data.employee });
        setStoredEmployeeDetailsComplete(isEmployeeDetailsComplete(data.employee));
      } catch {
        setError("Unable to load your details");
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [user?.user_id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    if (!isEmployeeDetailsComplete(details)) {
      setStoredEmployeeDetailsComplete(false);
      setSaving(false);
      setError("Please fill all required details (Address, City, State) before moving to other employee pages.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/employee/${user.user_id}/details`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: details.fullName,
          role: details.role,
          address: details.address,
          city: details.city,
          state: details.state,
          pincode: details.pincode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to save");
      setDetails({ ...emptyDetails, ...data.employee });
      setStoredEmployeeDetailsComplete(true);
      login({ ...user, name: data.employee.fullName }, localStorage.getItem("token"));
      setMessage("Details saved successfully. Employee portal is unlocked.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to save details"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-lg bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <UserCog size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#43567C]">Details</p>
            <h1 className="text-2xl font-bold text-slate-950">My profile details</h1>
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Complete these details once. Other employee pages stay locked until this is filled.
        </p>
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

      <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-500">Loading details...</p>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["id", "Employee ID"],
                ["email", "Email"],
                ["phone", "Phone"],
              ].map(([name, label]) => (
                <label key={name}>
                  <span className="text-xs font-semibold text-slate-500">{label}</span>
                  <input
                    disabled
                    value={details[name] || ""}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-500 outline-none"
                  />
                </label>
              ))}

              <label className="md:col-span-2">
                <span className="text-xs font-semibold text-slate-500">Address</span>
                <input
                  required
                  value={details.address || ""}
                  onChange={(e) => setDetails({ ...details, address: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#43567C] focus:ring-2 focus:ring-blue-100"
                />
              </label>

              {[["city", "City"], ["state", "State"]].map(([name, label]) => (
                <label key={name}>
                  <span className="text-xs font-semibold text-slate-500">{label}</span>
                  <input
                    required
                    value={details[name] || ""}
                    onChange={(e) => setDetails({ ...details, [name]: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#43567C] focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              ))}

              <label>
                <span className="text-xs font-semibold text-slate-500">Pincode</span>
                <input
                  value={details.pincode || ""}
                  onChange={(e) => setDetails({ ...details, pincode: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#43567C] focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>

            <button
              disabled={saving}
              className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-[#43567C] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save details"}
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default EmployeeDetails;
