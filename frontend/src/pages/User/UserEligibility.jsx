import { useEffect, useMemo, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const inputClass =
  "mt-1 box-border h-[42px] w-full rounded-lg border border-slate-200 px-3 text-sm leading-normal outline-none focus:border-[#43567C] focus:ring-2 focus:ring-blue-100";
const selectClass =
  `${inputClass} appearance-none bg-white bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10`;
const selectChevronStyle = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
};

const riskStyles = {
  low: "border-emerald-200 bg-emerald-50 text-emerald-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  high: "border-rose-200 bg-rose-50 text-rose-700",
};

const emptyForm = {
  loanAmount: 200000,
  tenureMonths: 12,
  monthlyIncome: "",
  dateOfBirth: "",
  gender: "",
  maritalStatus: "Single",
  numChildren: 0,
  educationLevel: "Graduate",
  employmentType: "Salaried",
  yearsEmployed: "",
  ownsCar: false,
  ownsHouse: false,
  regionType: "Urban",
  hasPastLoans: false,
  numPastLoans: 0,
  hadLatePayments: false,
  existingOutstandingDebt: "",
};

const formatPercent = (value) => {
  if (value === null || value === undefined) return "—";
  return `${Math.round(Number(value) * 100)}%`;
};

const formatShap = (value) => `${value >= 0 ? "+" : ""}${value.toFixed(3)}`;

const ShapBar = ({ feature }) => {
  const absValue = Math.abs(feature.shapValue);
  const width = Math.min(100, Math.max(6, absValue * 120));
  const isRisk = feature.direction === "risk";

  return (
    <div className="mb-3 flex items-center gap-3 text-xs last:mb-0">
      <span className="w-32 shrink-0 text-right text-slate-500">{feature.feature}</span>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full ${isRisk ? "bg-[#071a3f]" : "bg-emerald-500"}`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className={`w-16 text-right font-semibold ${isRisk ? "text-[#071a3f]" : "text-emerald-700"}`}>
        {formatShap(feature.shapValue)}
      </span>
    </div>
  );
};

const UserEligibility = () => {
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    const loadPrefill = async () => {
      if (!user?.user_id) {
        setLoading(false);
        return;
      }

      try {
        const [profileRes, appsRes] = await Promise.all([
          fetch(`http://localhost:8000/applicant/${user.user_id}/profile`),
          fetch(`http://localhost:8000/applicant/${user.user_id}/applications`),
        ]);
        const profileData = await profileRes.json();
        const appsData = await appsRes.json();

        const latest = (appsData.applications || [])[0];
        const profile = profileData.applicant || {};

        setForm((current) => ({
          ...current,
          loanAmount: latest?.loanAmount ?? current.loanAmount,
          tenureMonths: latest?.tenureMonths ?? current.tenureMonths,
          monthlyIncome: latest?.monthlyIncome ?? current.monthlyIncome,
          dateOfBirth: latest?.dateOfBirth || "",
          gender: latest?.gender || "",
          maritalStatus: latest?.maritalStatus || current.maritalStatus,
          numChildren: latest?.numChildren ?? current.numChildren,
          educationLevel: latest?.educationLevel || current.educationLevel,
          employmentType: latest?.employmentType || current.employmentType,
          yearsEmployed: latest?.yearsEmployed ?? current.yearsEmployed,
          ownsCar: Boolean(latest?.ownsCar),
          ownsHouse: Boolean(latest?.ownsHouse),
          regionType: latest?.regionType || current.regionType,
          hasPastLoans: Boolean(latest?.hasPastLoans),
          numPastLoans: latest?.numPastLoans ?? current.numPastLoans,
          hadLatePayments: Boolean(latest?.hadLatePayments),
          existingOutstandingDebt: latest?.existingOutstandingDebt ?? current.existingOutstandingDebt,
          genderFallback: profile.gender,
        }));
      } catch {
        // keep default form
      } finally {
        setLoading(false);
      }
    };

    loadPrefill();
  }, [user?.user_id]);

  const validationError = useMemo(() => {
    if (!form.monthlyIncome || Number(form.monthlyIncome) <= 0) return "Monthly income is required.";
    if (!form.dateOfBirth) return "Date of birth is required.";
    if (!form.gender) return "Gender is required.";
    return "";
  }, [form.dateOfBirth, form.gender, form.monthlyIncome]);

  const update = (patch) => setForm((current) => ({ ...current, ...patch }));

  const runCheck = async (event) => {
    event.preventDefault();
    setError("");
    if (validationError) {
      setError(validationError);
      return;
    }

    setChecking(true);
    try {
      const res = await fetch(`http://localhost:8000/applicant/${user.user_id}/eligibility-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loanAmount: Number(form.loanAmount),
          tenureMonths: Number(form.tenureMonths),
          monthlyIncome: Number(form.monthlyIncome),
          dateOfBirth: form.dateOfBirth,
          gender: form.gender,
          maritalStatus: form.maritalStatus,
          numChildren: Number(form.numChildren || 0),
          educationLevel: form.educationLevel,
          employmentType: form.employmentType,
          yearsEmployed: Number(form.yearsEmployed || 0),
          ownsCar: Boolean(form.ownsCar),
          ownsHouse: Boolean(form.ownsHouse),
          regionType: form.regionType,
          hasPastLoans: Boolean(form.hasPastLoans),
          numPastLoans: form.hasPastLoans ? Number(form.numPastLoans || 0) : 0,
          hadLatePayments: form.hasPastLoans ? Boolean(form.hadLatePayments) : false,
          existingOutstandingDebt: form.hasPastLoans ? Number(form.existingOutstandingDebt || 0) : 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Eligibility check failed.");
      setResult(data);
    } catch (err) {
      setError(err.message || "Eligibility check failed.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-5 px-4 py-6 md:px-8">
      <section className="rounded-lg bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-[#43567C]">Applicant</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">Eligibility</h1>
        <p className="mt-2 text-sm text-slate-500">
          Estimate your risk score and view SHAP drivers before submitting the final application.
        </p>
      </section>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
        <form onSubmit={runCheck} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          {loading ? (
            <p className="text-sm text-slate-500">Loading previous application details...</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold text-slate-500">Loan Amount (Rs.)</p>
                <input type="number" min="10000" className={inputClass} value={form.loanAmount} onChange={(e) => update({ loanAmount: e.target.value })} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Tenure (months)</p>
                <select className={selectClass} style={selectChevronStyle} value={form.tenureMonths} onChange={(e) => update({ tenureMonths: Number(e.target.value) })}>
                  {[6, 12, 24, 36, 60].map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Monthly Income (Rs.)</p>
                <input type="number" min="0" className={inputClass} value={form.monthlyIncome} onChange={(e) => update({ monthlyIncome: e.target.value })} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Years Employed</p>
                <input type="number" min="0" step="0.1" className={inputClass} value={form.yearsEmployed} onChange={(e) => update({ yearsEmployed: e.target.value })} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Date of Birth</p>
                <input type="date" className={inputClass} value={form.dateOfBirth || ""} onChange={(e) => update({ dateOfBirth: e.target.value })} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Gender</p>
                <select className={selectClass} style={selectChevronStyle} value={form.gender} onChange={(e) => update({ gender: e.target.value })}>
                  <option value="">Select</option>
                  <option value="M">M</option>
                  <option value="F">F</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={checking}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#43567C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#354868] disabled:opacity-70"
                >
                  {checking ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                  Check eligibility
                </button>
              </div>
            </div>
          )}
        </form>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          {!result ? (
            <p className="text-sm text-slate-500">Run eligibility check to view score and SHAP explanation.</p>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Risk score</p>
                  <p className="mt-1 text-3xl font-bold text-slate-950">{result.riskScore}/100</p>
                  <p className="mt-1 text-sm text-slate-600">Default probability: {formatPercent(result.defaultProbability)}</p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${riskStyles[result.riskLevel] || riskStyles.medium}`}>
                  {result.riskLevel} risk
                </span>
              </div>

              <p className="mt-3 text-sm text-slate-600">
                Recommendation: <span className="font-semibold capitalize text-slate-900">{result.riskRecommendation}</span>
              </p>
              {result.riskSource === "rules" && (
                <p className="mt-2 text-xs text-amber-700">
                  Using fallback rule-based scoring because trained model is unavailable.
                </p>
              )}

              {result.shapExplanation?.available ? (
                <div className="mt-5 rounded-lg border border-slate-200 bg-[#eef3f8] p-4">
                  <p className="text-sm font-bold text-slate-900">SHAP feature breakdown</p>
                  <p className="mt-1 text-xs text-slate-500">Positive values increase risk, negative values reduce risk.</p>
                  <div className="mt-3">
                    {result.shapExplanation.features.map((feature) => (
                      <ShapBar key={feature.featureKey} feature={feature} />
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  SHAP explanation is not available right now ({result.shapExplanation?.reason || "unknown"}).
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default UserEligibility;
