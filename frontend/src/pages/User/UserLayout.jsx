import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  ShieldCheck,
  Upload,
  User,
} from "lucide-react";
import logo from "../../assets/logo.png";
import { useAuth } from "../../context/AuthContext";
import {
  getStoredUserDetailsComplete,
  isUserDetailsComplete,
  setStoredUserDetailsComplete,
} from "../../utils/userDetails";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/user/dashboard", open: true },
  { label: "Details", icon: User, path: "/user/profile", open: true },
  { label: "Applications", icon: FileText, path: "/user/applications" },
  { label: "Documents", icon: Upload, path: "/user/documents" },
  { label: "Eligibility", icon: ShieldCheck, path: "/user/eligibility" },
  { label: "Support", icon: MessageCircle, path: "/user/support" },
];

const UserLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user?.user_id) return;

    fetch(`http://localhost:8000/applicant/${user.user_id}/profile`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.applicant) {
          setStoredUserDetailsComplete(isUserDetailsComplete(data.applicant));
        }
      })
      .catch(() => {});
  }, [user?.user_id]);

  return (
    <div className="min-h-screen bg-[#eef3f8] text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[248px_1fr]">
        <aside className="hidden border-r border-white/60 bg-[#071a3f] px-4 py-5 text-white lg:block">
          <div className="mb-8 flex items-center gap-3 px-2">
            <img src={logo} alt="CredPilot" className="h-9 w-9 object-contain" />
            <div>
              <p className="text-lg font-bold leading-none">CredPilot</p>
              <p className="mt-1 text-xs text-blue-200">Applicant workspace</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map(({ label, icon: Icon, path, open }) => {
              const active = location.pathname === path;

              return (
                <button
                  key={label}
                  onClick={() => {
                    if (!open && !getStoredUserDetailsComplete()) {
                      navigate("/user/profile");
                      return;
                    }

                    navigate(path);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    active
                      ? "bg-white text-[#071a3f] shadow-sm"
                      : "text-blue-100 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={17} />
                  <span className="font-medium">{label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-8 rounded-lg border border-white/10 bg-white/10 p-4">
            <p className="text-sm font-semibold">Need quick help?</p>
            <p className="mt-2 text-xs leading-relaxed text-blue-100">
              A loan advisor is available for your application review.
            </p>
            <button
              onClick={() => {
                if (!getStoredUserDetailsComplete()) {
                  navigate("/user/profile");
                  return;
                }
                navigate("/user/support");
              }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#071a3f]"
            >
              Start chat <ArrowRight size={14} />
            </button>
          </div>

          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="mt-6 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-200 hover:bg-red-500/10"
          >
            <LogOut size={17} />
            Logout
          </button>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
