import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../services/authAPI";
import {
  Mail, Lock, Eye, EyeOff, User, Phone,
  ArrowRight, CheckCircle2
} from "lucide-react";
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
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error,       setError]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const { fullName, email, phone, password, confirmPassword } = form;
    if (!fullName || !email || !phone || !password || !confirmPassword)
      return "Please fill in all fields.";
    if (!/\S+@\S+\.\S+/.test(email))
      return "Enter a valid email address.";
    if (!/^\d{10}$/.test(phone))
      return "Enter a valid 10-digit phone number.";
    if (password.length < 8)
      return "Password must be at least 8 characters.";
    if (password !== confirmPassword)
      return "Passwords do not match.";
    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

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
    "flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-3.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all";
  const inputField =
    "flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400";

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-10">

      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <img src={logo} alt="CredPilot" className="h-20 w-20 object-contain mb-3" />
        <h1 className="text-3xl font-bold">
          <span className="text-[#1a237e]">Cred</span>
          <span className="text-[#1565C0]">Pilot</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1 tracking-widest uppercase">
          Predict. Trust. Proceed.
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm">

        <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
        <p className="text-gray-400 text-sm mb-6">Sign up to get started with CredPilot</p>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm flex items-center gap-2">
            <CheckCircle2 size={16} />
            Account created! Redirecting to login…
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">

          {/* Full Name */}
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

          {/* Email */}
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

          {/* Phone */}
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

          {/* Password */}
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

          {/* Confirm Password */}
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

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl transition-all disabled:opacity-50 text-base"
          >
            {loading ? "Creating account…" : "Create Account"}
            {!loading && <ArrowRight size={18} />}
          </button>

        </form>

        {/* Already have account */}
        <p className="text-center text-sm text-gray-400 mt-6">
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