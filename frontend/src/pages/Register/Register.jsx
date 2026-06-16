import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../services/authAPI";
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, CheckCircle2 } from "lucide-react";
import logo from "../../assets/logo.png";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const { fullName, email, phone, password, confirmPassword } = form;
    if (!fullName || !email || !phone || !password || !confirmPassword) return "Please fill in all fields.";
    if (!/\S+@\S+\.\S+/.test(email)) return "Enter a valid email address.";
    if (!/^\d{10}$/.test(phone)) return "Enter a valid 10-digit phone number.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await registerUser(form.fullName, form.email, form.phone, form.password);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all";
  const inputField =
    "flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400";

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-transparent flex items-center justify-center px-4 py-4 sm:px-6 sm:py-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-white via-[#f6f9ff] to-[#dbeafe]" />
      <div className="pointer-events-none absolute -top-24 left-[-6rem] h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
      <div className="pointer-events-none absolute top-40 right-[-5rem] h-80 w-80 rounded-full bg-sky-200/40 blur-3xl" />
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

        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Create Account</h2>
        <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">Sign up to get started with CredPilot</p>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm flex items-center gap-2">
            <CheckCircle2 size={16} />
            Account created! Redirecting to login…
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-2.5 sm:space-y-3">
          <div className={inputBase}>
            <User size={18} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={form.fullName}
              onChange={set("fullName")}
              placeholder="Full Name"
              className={inputField}
            />
          </div>

          <div className={inputBase}>
            <Mail size={18} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={form.email}
              onChange={set("email")}
              placeholder="Email Address"
              className={inputField}
            />
          </div>

          <div className={inputBase}>
            <Phone size={18} className="text-gray-400 shrink-0" />
            <input
              type="tel"
              value={form.phone}
              onChange={set("phone")}
              placeholder="Phone Number"
              className={inputField}
            />
          </div>

          <div className={inputBase}>
            <Lock size={18} className="text-gray-400 shrink-0" />
            <input
              type={showPass ? "text" : "password"}
              value={form.password}
              onChange={set("password")}
              placeholder="Password (min. 8 characters)"
              className={inputField}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="text-gray-400 hover:text-gray-600"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className={inputBase}>
            <Lock size={18} className="text-gray-400 shrink-0" />
            <input
              type={showConfirm ? "text" : "password"}
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              placeholder="Confirm Password"
              className={inputField}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="text-gray-400 hover:text-gray-600"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-2xl transition-all disabled:opacity-50 text-sm sm:text-base"
          >
            {loading ? "Creating account…" : "Create Account"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="text-center text-xs sm:text-sm text-gray-400 mt-3 sm:mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
