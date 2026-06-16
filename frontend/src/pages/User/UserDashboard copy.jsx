import { useNavigate } from "react-router-dom";
import {
  Brain,
  Eye,
  Bolt,
  UserSearch,
  ArrowRight,
  Building2,
  ChartBar,
  CheckCircle,
  Sparkles,
  Rocket,
} from "lucide-react";
import logo from "../../assets/logo.png";

/* ─── tiny reusable helpers ─────────────────────────────────────── */

const Badge = ({ children }) => (
  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
    {children}
  </span>
);

const StatCard = ({ num, label }) => (
  <div className="flex flex-col items-center bg-gray-50 rounded-2xl px-6 py-5 border border-gray-100">
    <span className="text-2xl font-bold text-[#1565C0]">{num}</span>
    <span className="text-xs text-gray-400 mt-1 text-center">{label}</span>
  </div>
);

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="border border-gray-100 rounded-2xl p-5 bg-white hover:shadow-sm transition-all">
    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
      <Icon size={18} className="text-[#1565C0]" />
    </div>
    <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
    <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
  </div>
);

const Step = ({ num, title, desc, last }) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 border-2 ${
          last
            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
            : "border-[#1565C0] bg-blue-50 text-[#1565C0]"
        }`}
      >
        {num}
      </div>
      {!last && <div className="w-px flex-1 bg-gray-200 my-1" />}
    </div>
    <div className={`${last ? "pb-0" : "pb-6"}`}>
      <h4 className="text-sm font-semibold text-gray-900 mb-1">{title}</h4>
      <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
    </div>
  </div>
);

/* ─── main component ─────────────────────────────────────────────── */

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent text-gray-900 font-sans">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-white via-[#f6f9ff] to-[#dbeafe]" />
      <div className="pointer-events-none absolute -top-24 left-[-6rem] h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
      <div className="pointer-events-none absolute top-40 right-[-5rem] h-80 w-80 rounded-full bg-sky-200/40 blur-3xl" />

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-white/70 bg-white/80 px-6 py-4 backdrop-blur-md flex items-center justify-between sm:px-8 lg:px-12">
        <div className="flex items-center gap-2">
          <img src={logo} alt="CredPilot" className="h-8 w-8 object-contain" />
          <span className="text-xl font-bold">
            <span className="text-[#1a237e]">Cred</span>
            <span className="text-[#1565C0]">Pilot</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
          <a href="#features"   className="hover:text-gray-900 transition-colors">Features</a>
          <a href="#how"        className="hover:text-gray-900 transition-colors">How it works</a>
          <a href="#explainer"  className="hover:text-gray-900 transition-colors">About</a>
        </div>

        <button
          onClick={() => navigate("/register")}
          className="flex items-center gap-2 bg-[#1565C0] hover:bg-[#1a237e] text-white text-sm font-semibold px-5 py-2.5 rounded-2xl transition-all"
        >
          Get Started <ArrowRight size={15} />
        </button>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:py-20">
        <div className="flex flex-col items-start text-left gap-5">
          <Badge>
            <Brain size={13} /> AI-Powered Credit Risk
          </Badge>

          <h1 className="max-w-xl text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            Smarter Lending Decisions with{" "}
            <span className="text-[#1565C0]">Explainable AI</span>
          </h1>

          <p className="max-w-lg text-sm leading-relaxed text-gray-400 md:text-base">
            Predict loan default risk using machine learning in seconds. Built for
            banks, NBFCs, and lenders who need speed and trust.
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate("/register")}
              className="flex items-center gap-2 rounded-2xl bg-[#1565C0] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#1a237e]"
            >
              Try Demo <ArrowRight size={16} />
            </button>
            <a
              href="#features"
              className="flex items-center gap-2 rounded-2xl border-2 border-[#1565C0] px-6 py-3.5 text-sm font-semibold text-[#1565C0] transition-all hover:bg-blue-50"
            >
              Learn More
            </a>
          </div>

          <div className="grid w-full max-w-xl grid-cols-3 gap-3 pt-2 sm:grid-cols-3">
            <StatCard num="95%" label="Prediction reliability" />
            <StatCard num="300K+" label="Records analyzed" />
            <StatCard num="<2s" label="Real-time assessment" />
          </div>
        </div>

        {/* Hero graphic — mock risk card */}
        <div className="w-full max-w-xl justify-self-center rounded-[2rem] border border-white/70 bg-white/90 p-5 text-left shadow-[0_24px_80px_rgba(37,99,235,0.14)] backdrop-blur-sm space-y-4 sm:p-6">
          {/* Top row */}
          <div className="flex gap-3">
            <div className="flex-1 bg-white border border-gray-100 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Risk Score</p>
              <p className="text-2xl font-bold text-[#1565C0]">72 / 100</p>
              <p className="text-xs text-gray-400 mt-0.5">High risk applicant</p>
              <div className="mt-3 h-2 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full rounded-full bg-[#1565C0]" style={{ width: "72%" }} />
              </div>
            </div>
            <div className="flex-1 bg-white border border-gray-100 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Decision</p>
              <p className="text-base font-bold text-amber-600 mt-1">⚠ Review</p>
              <p className="text-xs text-gray-400 mt-0.5">Manual review suggested</p>
              <div className="mt-3 flex gap-1.5 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-full border border-gray-200 text-gray-500">ML Model</span>
                <span className="text-xs px-2 py-0.5 rounded-full border border-gray-200 text-gray-500">Explainable</span>
              </div>
            </div>
          </div>

          {/* SHAP breakdown */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-2.5">
            <p className="text-xs text-gray-400 font-medium mb-3">Feature Importance (SHAP)</p>
            {[
              { label: "Credit history",    pct: 82 },
              { label: "Debt-to-income",    pct: 64 },
              { label: "Employment tenure", pct: 47 },
              { label: "Loan amount",       pct: 31 },
            ].map(({ label, pct }) => (
              <div key={label} className="flex items-center gap-2 text-xs">
                <span className="w-28 text-right text-gray-400 shrink-0">{label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#1565C0]"
                    style={{ width: `${pct}%`, opacity: 0.4 + pct / 200 }}
                  />
                </div>
                <span className="text-gray-400 w-6">{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────── */}
      <section className="px-6 pb-12 lg:px-12">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard num="95%" label="Prediction reliability" />
          <StatCard num="300K+" label="Records analyzed" />
          <StatCard num="SHAP" label="Explainable AI built-in" />
          <StatCard num="<2s" label="Real-time assessment" />
        </div>
      </section>

      <div className="mx-6 border-t border-gray-100/80 lg:mx-12" />

      {/* ── Features ───────────────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-12 lg:px-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#1565C0] mb-2">Features</p>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Everything you need</h2>
        <p className="text-sm text-gray-400 leading-relaxed mb-8 max-w-md">
          Purpose-built for credit officers, analysts, and lenders who want
          fast, trustworthy decisions backed by data.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FeatureCard
            icon={Brain}
            title="AI risk prediction"
            desc="ML models trained on 300K+ records to predict loan default probability with high accuracy."
          />
          <FeatureCard
            icon={UserSearch}
            title="Borrower analysis"
            desc="Deep profile analysis covering credit history, income, employment, and repayment behavior."
          />
          <FeatureCard
            icon={Eye}
            title="Explainable AI"
            desc="SHAP-powered explanations show exactly which factors drove every risk score — no black boxes."
          />
          <FeatureCard
            icon={Bolt}
            title="Fast decisions"
            desc="Risk scores delivered in under 2 seconds. Built for high-volume lending environments."
          />
        </div>
      </section>

      <div className="mx-6 border-t border-gray-100/80 lg:mx-12" />

      {/* ── How it works ───────────────────────────────────────── */}
      <section id="how" className="px-6 py-12 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 items-start md:grid-cols-2">

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#1565C0] mb-2">How it works</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Four steps to a lending decision</h2>
            <p className="text-sm text-gray-400 leading-relaxed mb-8">
              From data entry to actionable insight in seconds.
            </p>
            <Step num="1" title="Enter applicant data"
              desc="Fill in borrower details — income, credit history, loan amount, and employment info." />
            <Step num="2" title="AI analyzes credit history"
              desc="Our ML model processes all inputs against patterns from 300K+ real loan records." />
            <Step num="3" title="Risk score generated"
              desc="A 0–100 risk score is produced with confidence levels and key risk drivers highlighted." />
            <Step num="4" title="Lending insights delivered" last
              desc="Get a clear approve / review / decline recommendation with SHAP explanations attached." />
          </div>

          {/* SHAP visual card */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
            <p className="text-xs text-gray-400 font-medium mb-4">
              SHAP feature breakdown — applicant #4821
            </p>
            <div className="space-y-3">
              {[
                { label: "Credit history",    pct: 82, val: "+0.82", pos: true },
                { label: "Debt-to-income",    pct: 64, val: "+0.64", pos: true },
                { label: "Employment",        pct: 47, val: "+0.47", pos: true },
                { label: "Loan amount",       pct: 31, val: "+0.31", pos: true },
                { label: "Collateral",        pct: 18, val: "−0.18", pos: false },
              ].map(({ label, pct, val, pos }) => (
                <div key={label} className="flex items-center gap-3 text-xs">
                  <span className="w-28 text-right text-gray-400 shrink-0">{label}</span>
                  <div className="flex-1 h-3 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pos ? "bg-[#1565C0]" : "bg-red-400"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className={`w-10 font-medium ${pos ? "text-[#1565C0]" : "text-red-500"}`}>
                    {val}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-300 mt-4 pt-3 border-t border-gray-200">
              Higher positive value = stronger risk signal
            </p>
          </div>
        </div>
      </section>

      <div className="mx-6 border-t border-gray-100/80 lg:mx-12" />

      {/* ── Explainability ─────────────────────────────────────── */}
      <section id="explainer" className="px-6 py-12 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 items-center md:grid-cols-2">

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#1565C0] mb-2">Transparency</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Not just predictions.<br />Explanations.
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed mb-3">
              Every risk score comes with a plain-language explanation of the
              factors that drove it — using SHAP, a gold-standard AI
              interpretability method.
            </p>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              No black boxes. Every officer can see exactly why a borrower was
              flagged, making audits cleaner and decisions defensible.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              <Sparkles size={12} /> LLM-powered suggestions coming soon
            </span>
          </div>

          {/* AI explanation mock card */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-4">
            <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
              <ChartBar size={13} /> AI explanation
            </p>
            <blockquote className="text-sm text-gray-700 leading-relaxed border-l-2 border-[#1565C0] pl-3">
              "This applicant's credit history shows 3 missed payments in the
              last 12 months, which is the primary driver of their elevated
              risk score of 72. Their debt-to-income ratio of 0.48 further
              compounds this risk."
            </blockquote>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Suggested actions</p>
              <div className="space-y-2">
                {[
                  "Request 6 months bank statements",
                  "Consider collateral-backed loan variant",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                    {item}
                  </div>
                ))}
                <div className="flex items-center gap-2 text-xs text-gray-300">
                  <Sparkles size={13} className="shrink-0" />
                  LLM-powered suggestions (coming soon)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-6 border-t border-gray-100/80 lg:mx-12" />

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="px-6 py-16 lg:px-12 flex flex-col items-center text-center gap-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
          <Rocket size={12} /> Ready to get started?
        </span>
        <h2 className="text-3xl font-bold text-gray-900 max-w-sm leading-snug">
          Make smarter lending decisions today
        </h2>
        <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
          Join the lenders already using CredPilot to reduce risk, speed up
          decisions, and explain every outcome.
        </p>
        <div className="flex items-center gap-3 flex-wrap justify-center mt-2">
          <button
            onClick={() => navigate("/register")}
            className="flex items-center gap-2 bg-[#1565C0] hover:bg-[#1a237e] text-white font-semibold px-7 py-4 rounded-2xl transition-all text-sm"
          >
            Start Assessment <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate("/register")}
            className="flex items-center gap-2 border-2 border-[#1565C0] text-[#1565C0] hover:bg-blue-50 font-semibold px-7 py-4 rounded-2xl transition-all text-sm"
          >
            <Building2 size={16} /> Bank / Employee Login
          </button>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 px-6 py-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <img src={logo} alt="CredPilot" className="h-6 w-6 object-contain" />
          <span className="text-base font-bold">
            <span className="text-[#1a237e]">Cred</span>
            <span className="text-[#1565C0]">Pilot</span>
          </span>
          <span className="text-gray-300 text-xs ml-2 hidden md:inline">
            Predict. Trust. Proceed.
          </span>
        </div>
        <div className="flex items-center gap-5 text-xs text-gray-400">
          <a href="#features" className="hover:text-gray-600">Features</a>
          <a href="#how" className="hover:text-gray-600">How it works</a>
          <a href="#explainer" className="hover:text-gray-600">About</a>
        </div>
        <p className="text-xs text-gray-300">© 2025 CredPilot. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default LandingPage;