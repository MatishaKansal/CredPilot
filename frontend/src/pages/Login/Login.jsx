import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../services/authAPI";
import { Mail, Lock, Eye, EyeOff, Building2, ArrowRight } from "lucide-react";
import logo from "../../assets/logo.png";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bankLoading, setBankLoading] = useState(false);

  const handleLogin = async (e, role = "applicant") => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await loginUser(email, password, role);
      login(data.user, data.token);
      if (data.user.role === "applicant") navigate("/user/dashboard");
      if (data.user.role === "officer") navigate("/employee/dashboard");
      if (data.user.role === "admin") navigate("/admin/dashboard");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleBankLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setBankLoading(true);
    setError("");

    try {
      const data = await loginUser(email, password, "officer");
      login(data.user, data.token);
      if (data.user.role === "officer") navigate("/employee/dashboard");
      if (data.user.role === "admin") navigate("/admin/dashboard");
    } catch {
      setError("Invalid email or password");
    } finally {
      setBankLoading(false);
    }
  };

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-transparent flex items-center justify-center px-4 py-4 sm:px-6 sm:py-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-white via-[#f6f9ff] to-[#dbeafe]" />
      <div className="pointer-events-none absolute -top-24 left-[-6rem] h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
      <div className="pointer-events-none absolute top-40 right-[-5rem] h-80 w-80 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white px-5 py-6 shadow-[0_24px_70px_rgba(7,26,63,0.12)] sm:px-8 sm:py-8">
        <div className="flex flex-col items-center mb-4 sm:mb-6">
          <img src={logo} alt="CredPilot" className="h-12 w-12 sm:h-14 sm:w-14 object-contain mb-2" />
          <h1 className="text-xl sm:text-2xl font-bold">
            <span className="text-[#071a3f]">Cred</span>
            <span className="text-blue-700">Pilot</span>
          </h1>
          <p className="text-slate-400 text-[10px] sm:text-xs mt-1 tracking-widest uppercase text-center">
            Predict. Trust. Proceed.
          </p>
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-slate-950 mb-1">Welcome Back!</h2>
        <p className="text-slate-500 text-xs sm:text-sm mb-3 sm:mb-4">Login to continue to your account</p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-2.5 sm:space-y-3">
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 transition-all focus-within:border-blue-700 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
            <Mail size={18} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email or Phone Number"
              className="flex-1 text-sm outline-none bg-transparent text-slate-800 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 transition-all focus-within:border-blue-700 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
            <Lock size={18} className="text-slate-400 shrink-0" />
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="flex-1 text-sm outline-none bg-transparent text-slate-800 placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="text-slate-400 hover:text-slate-700"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs sm:text-sm text-blue-700 font-medium hover:text-blue-900">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-700 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-900 disabled:opacity-50 sm:text-base"
          >
            {loading ? "Logging in..." : "Login"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="flex items-center gap-3 my-3 sm:my-4">
          <div className="flex-1 border-t border-slate-200" />
          <span className="text-slate-400 text-sm">or</span>
          <div className="flex-1 border-t border-slate-200" />
        </div>

        <button
          onClick={handleBankLogin}
          disabled={bankLoading}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-[#071a3f] py-3 text-sm font-semibold text-[#071a3f] transition-all hover:bg-[#071a3f] hover:text-white disabled:opacity-50 sm:text-base"
        >
          <Building2 size={18} />
          {bankLoading ? "Logging in..." : "Login as Bank / Employee"}
        </button>

        <p className="text-center text-xs sm:text-sm text-slate-500 mt-3 sm:mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-700 font-semibold hover:text-blue-900">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
