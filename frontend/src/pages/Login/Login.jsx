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
    <div className="h-[100dvh] overflow-hidden bg-transparent flex items-center justify-center px-4 py-4 sm:px-6 sm:py-6">
      <div className="w-full max-w-md rounded-[1rem] border border-[#1D4ED8]/70 bg-white px-5 py-6 shadow-[0_30px_80px_rgba(37,99,235,0.18)] sm:px-8 sm:py-8">
        <div className="flex flex-col items-center mb-4 sm:mb-6">
          <img src={logo} alt="CredPilot" className="h-12 w-12 sm:h-14 sm:w-14 object-contain mb-2" />
          <h1 className="text-xl sm:text-2xl font-bold">
            <span className="text-[#1a237e]">Cred</span>
            <span className="text-[#1565C0]">Pilot</span>
          </h1>
          <p className="text-gray-400 text-[10px] sm:text-xs mt-1 tracking-widest uppercase text-center">
            Predict. Trust. Proceed.
          </p>
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Welcome Back!</h2>
        <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">Login to continue to your account</p>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-2.5 sm:space-y-3">
          <div className="flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Mail size={18} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email or Phone Number"
              className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Lock size={18} className="text-gray-400 shrink-0" />
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="text-gray-400 hover:text-gray-600"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs sm:text-sm text-blue-600 font-medium hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-2xl transition-all disabled:opacity-50 text-sm sm:text-base"
          >
            {loading ? "Logging in..." : "Login"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="flex items-center gap-3 my-3 sm:my-4">
          <div className="flex-1 border-t border-gray-200" />
          <span className="text-gray-400 text-sm">or</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        <button
          onClick={handleBankLogin}
          disabled={bankLoading}
          className="w-full flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-600 font-semibold py-3 rounded-2xl hover:bg-blue-50 transition-all disabled:opacity-50 text-sm sm:text-base"
        >
          <Building2 size={18} />
          {bankLoading ? "Logging in..." : "Login as Bank / Employee"}
        </button>

        <p className="text-center text-xs sm:text-sm text-gray-400 mt-3 sm:mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
