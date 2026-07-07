import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, FileText, Info, Send } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const STEPS = [
  { id: 1, title: "Personal Details" },
  { id: 2, title: "Employment & Income" },
  { id: 3, title: "Loan Request Details" },
  { id: 4, title: "Credit History" },
];

const inputClass =
  "mt-1 box-border h-[42px] w-full rounded-lg border border-slate-200 px-3 text-sm leading-normal outline-none focus:border-[#43567C] focus:ring-2 focus:ring-blue-100";
const selectClass =
  `${inputClass} appearance-none bg-white bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10`;
const selectChevronStyle = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
};
const textareaClass =
  "mt-1 box-border min-h-[88px] w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#43567C] focus:ring-2 focus:ring-blue-100";
const labelClass = "text-xs font-semibold text-slate-500";

const emptyForm = {
  fullName: "",
  dateOfBirth: "",
  gender: "",
  maritalStatus: "",
  numChildren: 0,
  educationLevel: "",
  phoneNumber: "",
  address: "",
  employmentType: "",
  yearsEmployed: "",
  monthlyIncome: "",
  ownsCar: false,
  ownsHouse: false,
  regionType: "",
  loanAmount: 200000,
  loanPurpose: "",
  tenureMonths: 12,
  hasPastLoans: false,
  numPastLoans: 0,
  hadLatePayments: false,
  existingOutstandingDebt: "",
};

const MARITAL_STATUSES_WITH_CHILDREN = ["Married", "Divorced", "Widowed"];

const showChildrenField = (maritalStatus) =>
  MARITAL_STATUSES_WITH_CHILDREN.includes(maritalStatus);

const formatDateForInput = (value) => {
  if (!value) return "";
  const str = String(value);
  return str.includes("T") ? str.slice(0, 10) : str;
};

const prefillFromApplication = (application) => ({
  fullName: application.fullName || "",
  dateOfBirth: formatDateForInput(application.dateOfBirth),
  gender: application.gender || "",
  maritalStatus: application.maritalStatus || "",
  numChildren: application.numChildren ?? 0,
  educationLevel: application.educationLevel || "",
  phoneNumber: application.phoneNumber || "",
  address: application.address || "",
  employmentType: application.employmentType || "",
  yearsEmployed:
    application.yearsEmployed != null && application.yearsEmployed !== ""
      ? String(application.yearsEmployed)
      : "",
  monthlyIncome:
    application.monthlyIncome != null && application.monthlyIncome !== ""
      ? String(application.monthlyIncome)
      : "",
  ownsCar: Boolean(application.ownsCar),
  ownsHouse: Boolean(application.ownsHouse),
  regionType: application.regionType || "",
});

const formatCurrency = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

const RequiredStar = () => <span className="text-red-500"> *</span>;

const Field = ({ label, children, className = "", required = false, hint }) => (
  <div className={`flex w-full min-w-0 flex-col ${className}`.trim()}>
    <span className={`${labelClass} block`}>
      {label}
      {required && <RequiredStar />}
    </span>
    {children}
    {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
  </div>
);

const YesNoField = ({ label, value, onChange, name, className = "", required = false }) => (
  <Field label={label} required={required} className={className}>
    <div className="mt-1 flex h-[42px] items-center gap-6">
      {[
        { option: true, text: "Yes" },
        { option: false, text: "No" },
      ].map(({ option, text }) => (
        <label key={text} className="flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            name={name}
            checked={value === option}
            onChange={() => onChange(option)}
            className="h-4 w-4 border-slate-300 text-[#43567C] focus:ring-2 focus:ring-blue-100"
          />
          <span className="text-sm text-slate-700">{text}</span>
        </label>
      ))}
    </div>
  </Field>
);

const SimpleCheckbox = ({ label, checked, onChange, className = "" }) => (
  <label className={`flex cursor-pointer items-center gap-2.5 ${className}`.trim()}>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-4 w-4 shrink-0 rounded border-slate-300 text-[#43567C] focus:ring-2 focus:ring-blue-100"
    />
    <span className="text-sm font-semibold text-slate-800">{label}</span>
  </label>
);

const StepProgress = ({ step }) => (
  <div className="mt-5 w-full">
    <div className="relative flex w-full items-center justify-between">
      <div className="absolute left-4 right-4 top-4 h-0.5 bg-slate-200" />
      {STEPS.map(({ id }) => (
        <div key={id} className="relative z-10 flex flex-col items-center bg-white px-1">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
              step === id
                ? "bg-[#43567C] text-white"
                : step > id
                  ? "bg-emerald-600 text-white"
                  : "border border-slate-200 bg-white text-slate-400"
            }`}
          >
            {id}
          </span>
        </div>
      ))}
    </div>
    <p className="mt-3 text-center text-sm font-semibold text-slate-700">
      Step {step} of {STEPS.length}: {STEPS[step - 1].title}
    </p>
  </div>
);

const UserApplicationForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [prefilledFromPrevious, setPrefilledFromPrevious] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadInitialData = async () => {
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

        let nextForm = { ...emptyForm };

        if (profileRes.ok && profileData.applicant) {
          const profile = profileData.applicant;
          nextForm = {
            ...nextForm,
            fullName: profile.fullName || user.name || "",
            phoneNumber: profile.phone || "",
            address: [profile.address, profile.city, profile.state, profile.pincode]
              .filter(Boolean)
              .join(", "),
          };
        } else {
          nextForm.fullName = user?.name || "";
        }

        const previousApps = appsData.applications || [];
        if (previousApps.length > 0) {
          nextForm = { ...nextForm, ...prefillFromApplication(previousApps[0]) };
          setPrefilledFromPrevious(true);
        }

        setForm(nextForm);
      } catch {
        setForm({ ...emptyForm, fullName: user?.name || "" });
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [user?.user_id, user?.name]);

  const update = (patch) => setForm((current) => ({ ...current, ...patch }));

  const childrenVisible = showChildrenField(form.maritalStatus);

  const validateStep = () => {
    if (step === 1) {
      if (!form.fullName || !form.dateOfBirth || !form.gender || !form.maritalStatus ||
          !form.educationLevel || !form.phoneNumber || !form.address) {
        setError("Please fill all required personal details.");
        return false;
      }
    }
    if (step === 2) {
      if (!form.employmentType || !form.monthlyIncome || !form.regionType) {
        setError("Please fill all required employment fields.");
        return false;
      }
    }
    if (step === 3) {
      if (!form.loanAmount || !form.loanPurpose || !form.tenureMonths) {
        setError("Please fill all required loan request fields.");
        return false;
      }
    }
    if (step === 4) {
      if (form.hasPastLoans && Number(form.numPastLoans) < 1) {
        setError("Please enter the number of previous loans.");
        return false;
      }
    }
    setError("");
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((current) => Math.min(4, current + 1));
  };

  const handleFormKeyDown = (event) => {
    if (event.key !== "Enter") return;
    const tag = event.target.tagName;
    if (tag === "TEXTAREA") return;
    if (step < 4) {
      event.preventDefault();
      handleNext();
    }
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();
    if (step !== 4 || !validateStep()) return;

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`http://localhost:8000/applicant/${user.user_id}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          dateOfBirth: form.dateOfBirth,
          gender: form.gender,
          maritalStatus: form.maritalStatus,
          numChildren: childrenVisible ? Number(form.numChildren) : 0,
          educationLevel: form.educationLevel,
          phoneNumber: form.phoneNumber,
          address: form.address,
          employmentType: form.employmentType,
          yearsEmployed: Number(form.yearsEmployed || 0),
          monthlyIncome: Number(form.monthlyIncome),
          ownsCar: form.ownsCar,
          ownsHouse: form.ownsHouse,
          regionType: form.regionType,
          loanAmount: Number(form.loanAmount),
          loanPurpose: form.loanPurpose,
          tenureMonths: Number(form.tenureMonths),
          hasPastLoans: form.hasPastLoans,
          numPastLoans: form.hasPastLoans ? Number(form.numPastLoans) : 0,
          hadLatePayments: form.hasPastLoans ? form.hadLatePayments : false,
          existingOutstandingDebt: form.hasPastLoans ? Number(form.existingOutstandingDebt || 0) : 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to submit application");

      setMessage(`Application ${data.application.applicationId} submitted successfully.`);
      setTimeout(() => navigate("/user/applications"), 1500);
    } catch (err) {
      setError(err.message || "Unable to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 px-4 py-6 md:px-8">
      <section className="rounded-lg bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <FileText size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="m-0 text-sm font-semibold leading-none text-[#43567C]">Apply for Loan</p>
            <h1 className="m-0 mt-1 text-2xl font-bold leading-tight text-slate-950">Loan Application Form</h1>
            <p className="mt-3 text-sm text-slate-500">
              Complete all four steps below. Fields marked with
              <span className="text-red-500"> *</span>
              {" "}are required.
            </p>
          </div>
        </div>
        <StepProgress step={step} />
      </section>

      {prefilledFromPrevious && !loading && (
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <Info size={18} className="mt-0.5 shrink-0" />
          <p>
            Your personal and employment details have been filled in from your last application.
            You can edit any field before submitting.
          </p>
        </div>
      )}

      {(message || error) && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${
          error
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-emerald-200 bg-emerald-50 text-emerald-700"
        }`}>
          {error || message}
        </div>
      )}

      <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        {loading ? (
          <p className="text-sm text-slate-500">Loading your Profile...</p>
        ) : (
          <>
            {step === 1 && (
              <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 md:gap-x-8 md:gap-y-5">
                <Field label="Full Name" className="md:col-span-2" required>
                  <input required className={inputClass} value={form.fullName} onChange={(e) => update({ fullName: e.target.value })} />
                </Field>
                <Field label="Date of Birth" required>
                  <input required type="date" className={inputClass} value={form.dateOfBirth} onChange={(e) => update({ dateOfBirth: e.target.value })} />
                </Field>
                <Field label="Gender" required>
                  <select required className={selectClass} style={selectChevronStyle} value={form.gender} onChange={(e) => update({ gender: e.target.value })}>
                    <option value="">Select</option>
                    <option value="M">M</option>
                    <option value="F">F</option>
                  </select>
                </Field>
                <Field label="Education" required>
                  <select required className={selectClass} style={selectChevronStyle} value={form.educationLevel} onChange={(e) => update({ educationLevel: e.target.value })}>
                    <option value="">Select</option>
                    <option value="Secondary">Secondary</option>
                    <option value="Higher Secondary">Higher Secondary</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                    <option value="Other">Other</option>
                  </select>
                </Field>
                <Field label="Phone number" required>
                  <input required type="tel" className={inputClass} value={form.phoneNumber} onChange={(e) => update({ phoneNumber: e.target.value })} />
                </Field>
                <Field label="Marital Status" required>
                  <select
                    required
                    className={selectClass}
                    style={selectChevronStyle}
                    value={form.maritalStatus}
                    onChange={(e) => {
                      const maritalStatus = e.target.value;
                      update({
                        maritalStatus,
                        numChildren: showChildrenField(maritalStatus) ? form.numChildren : 0,
                      });
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </Field>
                {childrenVisible ? (
                  <Field label="Number of Children">
                    <input
                      type="number"
                      min="0"
                      max="15"
                      value={form.numChildren}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        update({ numChildren: Number.isNaN(next) ? 0 : Math.min(15, Math.max(0, next)) });
                      }}
                      className={`${inputClass} block w-24 max-w-full`}
                    />
                  </Field>
                ) : (
                  <div className="hidden md:block" aria-hidden="true" />
                )}
                <Field label="Address" className="md:col-span-2" required>
                  <textarea required rows={3} className={textareaClass} value={form.address} onChange={(e) => update({ address: e.target.value })} />
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 md:gap-x-8 md:gap-y-5">
                <Field label="Employment Type" required>
                  <select required className={selectClass} style={selectChevronStyle} value={form.employmentType} onChange={(e) => update({ employmentType: e.target.value })}>
                    <option value="">Select</option>
                    <option value="Salaried">Salaried</option>
                    <option value="Self-employed">Self-Employed</option>
                    <option value="Daily wage">Daily Wage</option>
                    <option value="Unemployed">Unemployed</option>
                  </select>
                </Field>
                <Field label="Years Employed">
                  <input type="number" min="0" step="0.1" className={inputClass} value={form.yearsEmployed} onChange={(e) => update({ yearsEmployed: e.target.value })} />
                </Field>
                <Field label="Monthly Income (Rs.)" required>
                  <input required type="number" min="0" className={inputClass} value={form.monthlyIncome} onChange={(e) => update({ monthlyIncome: e.target.value })} />
                </Field>
                <Field label="Region type" required>
                  <select required className={selectClass} style={selectChevronStyle} value={form.regionType} onChange={(e) => update({ regionType: e.target.value })}>
                    <option value="">Select</option>
                    <option value="Urban">Urban</option>
                    <option value="Semi-urban">Semi-urban</option>
                    <option value="Rural">Rural</option>
                  </select>
                </Field>
                <div className="flex flex-col gap-3 md:col-span-2">
                  <SimpleCheckbox
                    label="Owns a Vehicle"
                    checked={form.ownsCar}
                    onChange={(ownsCar) => update({ ownsCar })}
                  />
                  <SimpleCheckbox
                    label="Owns a Residential Property"
                    checked={form.ownsHouse}
                    onChange={(ownsHouse) => update({ ownsHouse })}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 md:gap-x-8 md:gap-y-5">
                <Field label="Loan Purpose" required>
                  <select required className={selectClass} style={selectChevronStyle} value={form.loanPurpose} onChange={(e) => update({ loanPurpose: e.target.value })}>
                    <option value="">Select</option>
                    <option value="Business">Business</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Education">Education</option>
                    <option value="Home">Home</option>
                    <option value="Vehicle">Vehicle Purchase</option>
                    <option value="Medical">Medical</option>
                    <option value="Other">Other</option>
                  </select>
                </Field>
                <Field label="Repayment Period (in months)" required>
                  <select required className={selectClass} style={selectChevronStyle} value={form.tenureMonths} onChange={(e) => update({ tenureMonths: Number(e.target.value) })}>
                    {[6, 12, 24, 36, 60].map((months) => (
                      <option key={months} value={months}>{months}</option>
                    ))}
                  </select>
                </Field>
                
                <Field label={`Loan amount (${formatCurrency(form.loanAmount)})`} className="md:col-span-2" required>
                  <input
                    type="range"
                    min="10000"
                    max="5000000"
                    step="10000"
                    value={form.loanAmount}
                    onChange={(e) => update({ loanAmount: Number(e.target.value) })}
                    className="mt-2 w-full accent-[#43567C]"
                  />
                  <input
                    required
                    type="number"
                    min="10000"
                    className={`${inputClass} mt-3`}
                    value={form.loanAmount}
                    onChange={(e) => update({ loanAmount: Number(e.target.value) })}
                  />
                </Field>
              </div>
            )}

            {step === 4 && (
              <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 md:gap-x-8 md:gap-y-5">
                <YesNoField
                  label="Have you taken loans before?"
                  name="hasPastLoans"
                  value={form.hasPastLoans}
                  required
                  className="md:col-span-2"
                  onChange={(hasPastLoans) => update({
                    hasPastLoans,
                    numPastLoans: hasPastLoans ? form.numPastLoans : 0,
                    hadLatePayments: hasPastLoans ? form.hadLatePayments : false,
                    existingOutstandingDebt: hasPastLoans ? form.existingOutstandingDebt : "",
                  })}
                />
                {form.hasPastLoans ? (
                  <>
                    <Field label="Number of Previous Loans" required>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        required
                        value={form.numPastLoans || ""}
                        onChange={(e) => {
                          const next = Number(e.target.value);
                          update({ numPastLoans: Number.isNaN(next) ? 0 : Math.min(20, Math.max(0, next)) });
                        }}
                        className={`${inputClass} block w-full max-w-xs`}
                      />
                    </Field>
                    <Field label="Current Outstanding Debt (Rs.) required">
                      <input
                        type="number"
                        min="0"
                        className={inputClass}
                        value={form.existingOutstandingDebt}
                        onChange={(e) => update({ existingOutstandingDebt: e.target.value })}
                      />
                    </Field>
                    <YesNoField
                      label="Any History of Late Payments?"
                      name="hadLatePayments"
                      value={form.hadLatePayments}
                      className="md:col-span-2"
                      onChange={(hadLatePayments) => update({ hadLatePayments })}
                    />
                  </>
                ) : null}
              </div>
            )}

            <div className="mt-6 flex w-full items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => (step === 1 ? navigate("/user/dashboard") : setStep((current) => current - 1))}
                className="flex h-[42px] items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft size={16} />
                {step === 1 ? "Back to dashboard" : "Previous"}
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex h-[42px] items-center justify-center gap-2 rounded-lg bg-[#43567C] px-4 text-sm font-semibold text-white hover:bg-blue-900"
                >
                  Next <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex h-[42px] items-center justify-center gap-2 rounded-lg bg-[#43567C] px-4 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
                >
                  <Send size={16} />
                  {submitting ? "Submitting..." : "Submit application"}
                </button>
              )}
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default UserApplicationForm;
