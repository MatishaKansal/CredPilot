import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Building2,
  CheckCircle,
  Eye,
  FileText,
  Rocket,
  ShieldCheck,
  Sparkles,
  UserSearch,
  Zap,
} from "lucide-react";
import logo from "../../assets/logo.png";

const StatCard = ({ num, label }) => (
  <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
    <span className="block text-2xl font-bold text-[#071a3f]">{num}</span>
    <span className="mt-1 block text-xs text-slate-500">{label}</span>
  </div>
);

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-[#071a3f]/30 hover:shadow-md">
    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#071a3f] text-white">
      <Icon size={18} />
    </div>
    <h3 className="mb-1 text-sm font-semibold text-slate-950">{title}</h3>
    <p className="text-xs leading-relaxed text-slate-500">{desc}</p>
  </div>
);

const Step = ({ num, title, desc, last }) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#071a3f] bg-slate-100 text-sm font-semibold text-[#071a3f]">
        {num}
      </div>
      {!last && <div className="my-1 w-px flex-1 bg-slate-200" />}
    </div>
    <div className={last ? "pb-0" : "pb-5"}>
      <h4 className="mb-1 text-sm font-semibold text-slate-950">{title}</h4>
      <p className="text-xs leading-relaxed text-slate-500">{desc}</p>
    </div>
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#eef3f8] font-sans text-slate-900">
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-[#071a3f]/95 px-6 py-4 text-white backdrop-blur-md sm:px-8 lg:px-12">
        <div className="flex items-center gap-2">
          <img src={logo} alt="CredPilot" className="h-8 w-8 object-contain" />
          <span className="text-xl font-bold">
            <span className="text-blue-200">Cred</span>
            <span className="text-white">Pilot</span>
          </span>
        </div>

        <div className="hidden items-center gap-6 text-sm text-blue-100 md:flex">
          <a href="#features" className="transition-colors hover:text-white">Features</a>
          <a href="#how" className="transition-colors hover:text-white">How it works</a>
          <a href="#explainer" className="transition-colors hover:text-white">About</a>
        </div>

        <button
          onClick={() => navigate("/register")}
          className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[#071a3f] transition-all hover:bg-blue-50"
        >
          Get Started <ArrowRight size={15} />
        </button>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-12 lg:py-16">
        <div className="flex max-w-3xl flex-col items-start gap-5 text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-[#071a3f] shadow-sm">
            <Brain size={13} /> AI-Powered Credit Risk
          </span>

          <h1 className="max-w-xl text-4xl font-bold leading-tight text-[#071a3f] md:text-5xl lg:text-6xl">
            Smarter Lending Decisions with{" "}
            <span className="text-[#071a3f]">Explainable AI</span>
          </h1>

          <p className="max-w-lg text-sm leading-relaxed text-slate-600 md:text-base">
            Predict loan default risk using machine learning in seconds. Built for
            banks, NBFCs, and lenders who need speed and trust.
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate("/register")}
              className="flex items-center gap-2 rounded-lg bg-[#43567C] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#10275a]"
            >
              Try Demo <ArrowRight size={16} />
            </button>
            <a
              href="#features"
              className="flex items-center gap-2 rounded-lg border border-[#071a3f] bg-white px-6 py-3.5 text-sm font-semibold text-[#071a3f] transition-all hover:bg-[#071a3f] hover:text-white"
            >
              Learn More
            </a>
          </div>

          <div className="grid w-full max-w-xl grid-cols-3 gap-3 pt-2">
            <StatCard num="95%" label="Prediction reliability" />
            <StatCard num="300K+" label="Records analyzed" />
            <StatCard num="<2s" label="Real-time assessment" />
          </div>
        </div>
      </section>

      <section className="px-6 pb-12 lg:px-12">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard num="95%" label="Prediction reliability" />
          <StatCard num="300K+" label="Records analyzed" />
          <StatCard num="SHAP" label="Explainable AI built-in" />
          <StatCard num="<2s" label="Real-time assessment" />
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#071a3f]">Features</p>
            <h2 className="text-2xl font-bold text-slate-950">Everything you need</h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-slate-500">
            Purpose-built for credit officers, analysts, and lenders who want
            fast, trustworthy decisions backed by data.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
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
            desc="SHAP-powered explanations show exactly which factors drove every risk score."
          />
          <FeatureCard
            icon={Zap}
            title="Fast decisions"
            desc="Risk scores delivered in under 2 seconds. Built for high-volume lending environments."
          />
        </div>
      </section>

      <section id="how" className="border-y border-slate-200 bg-white px-6 py-12 lg:px-12">
        <div className="mx-auto grid max-w-7xl items-start gap-10 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#071a3f]">How it works</p>
            <h2 className="mb-2 text-2xl font-bold text-slate-950">Four steps to a lending decision</h2>
            <p className="mb-8 text-sm leading-relaxed text-slate-500">
              From data entry to actionable insight in seconds.
            </p>
            <Step num="1" title="Enter applicant data" desc="Fill in borrower details, income, credit history, loan amount, and employment info." />
            <Step num="2" title="AI analyzes credit history" desc="Our ML model processes all inputs against patterns from real loan records." />
            <Step num="3" title="Risk score generated" desc="A 0-100 risk score is produced with confidence levels and key risk drivers highlighted." />
            <Step num="4" title="Lending insights delivered" last desc="Get a clear approve, review, or decline recommendation with SHAP explanations attached." />
          </div>

          <div className="grid gap-4">
            <div className="rounded-lg bg-[#43567C] p-5 text-white">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold">SHAP feature breakdown</p>
                  <p className="mt-1 text-xs leading-relaxed text-blue-100">
                    Higher positive value means stronger risk signal for the current applicant.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-[#eef3f8] p-5">
              {[
                { label: "Credit history", pct: 82, val: "+0.82", pos: true },
                { label: "Debt-to-income", pct: 64, val: "+0.64", pos: true },
                { label: "Employment", pct: 47, val: "+0.47", pos: true },
                { label: "Loan amount", pct: 31, val: "+0.31", pos: true },
                { label: "Collateral", pct: 18, val: "-0.18", pos: false },
              ].map(({ label, pct, val, pos }) => (
                <div key={label} className="mb-3 flex items-center gap-3 text-xs last:mb-0">
                  <span className="w-28 shrink-0 text-right text-slate-500">{label}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
                    <div className={`h-full rounded-full ${pos ? "bg-[#071a3f]" : "bg-red-400"}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className={`w-10 font-medium ${pos ? "text-[#071a3f]" : "text-red-500"}`}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="explainer" className="px-6 py-12 lg:px-12">
        <div className="mx-auto grid max-w-7xl items-center gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-[#071a3f] p-6 text-white">
            <ShieldCheck size={26} className="text-emerald-300" />
            <h2 className="mt-5 text-2xl font-bold">Not just predictions. Explanations.</h2>
            <p className="mt-3 text-sm leading-relaxed text-blue-100">
              Every risk score comes with a plain-language explanation of the factors that drove it.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <FileText size={24} className="text-[#071a3f]" />
            <h3 className="mt-4 text-lg font-bold text-slate-950">Suggested actions</h3>
            <div className="mt-4 space-y-3">
              {["Request 6 months bank statements", "Consider collateral-backed loan variant"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle size={15} className="shrink-0 text-emerald-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <Sparkles size={24} className="text-amber-500" />
            <h3 className="mt-4 text-lg font-bold text-slate-950">LLM suggestions</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              LLM-powered suggestions coming soon for faster officer review and clearer applicant guidance.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 pb-14 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 rounded-lg bg-[#43567C] p-6 text-center text-white shadow-[0_24px_70px_rgba(7,26,63,0.18)] md:flex-row md:p-8 md:text-left">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
              <Rocket size={12} /> Ready to get started?
            </span>
            <h2 className="mt-3 text-3xl font-bold">Make smarter lending decisions today</h2>
            <p className="mt-2 max-w-xl text-sm text-blue-100">
              Join the lenders already using CredPilot to reduce risk, speed up decisions, and explain every outcome.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate("/register")}
              className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#071a3f] transition-all hover:bg-blue-50"
            >
              Start Assessment <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 rounded-lg border border-white/15 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              <Building2 size={16} /> Bank / Employee Login
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-6 py-6 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 md:flex-row">
          <div className="flex items-center gap-2">
            <img src={logo} alt="CredPilot" className="h-6 w-6 object-contain" />
            <span className="text-base font-bold">
              <span className="text-[#071a3f]">Cred</span>
              <span className="text-[#071a3f]">Pilot</span>
            </span>
            <span className="ml-2 hidden text-xs text-slate-400 md:inline">
              Predict. Trust. Proceed.
            </span>
          </div>
          <div className="flex items-center gap-5 text-xs text-slate-500">
            <a href="#features" className="hover:text-slate-950">Features</a>
            <a href="#how" className="hover:text-slate-950">How it works</a>
            <a href="#explainer" className="hover:text-slate-950">About</a>
          </div>
          <p className="text-xs text-slate-400">2025 CredPilot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
