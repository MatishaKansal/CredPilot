import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Search,
  TrendingUp,
  UserCog,
  Users,
} from "lucide-react";
import logo from "../../assets/logo.png";
import { getStoredEmployeeDetailsComplete } from "../../utils/employeeDetails";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/employee/dashboard", open: true },
  { label: "Details", icon: UserCog, path: "/employee/details", open: true },
  { label: "Customers", icon: Users, path: "/employee/customers" },
  { label: "Applications", icon: FileText, path: "/employee/applications" },
  { label: "Reports", icon: TrendingUp, path: "/employee/reports" },
  { label: "Support", icon: MessageCircle, path: "/employee/support" },
];

const EmployeeLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#eef3f8] text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[248px_1fr]">
        <aside className="hidden border-r border-white/60 bg-[#071a3f] px-4 py-5 text-white lg:block">
          <div className="mb-8 flex items-center gap-3 px-2">
            <img src={logo} alt="CredPilot" className="h-9 w-9 object-contain" />
            <div>
              <p className="text-lg font-bold leading-none">CredPilot</p>
              <p className="mt-1 text-xs text-blue-200">Employee Portal</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map(({ label, icon: Icon, path, open }) => {
              const active = location.pathname === path;

              return (
                <button
                  key={label}
                  onClick={() => {
                    if (!open && !getStoredEmployeeDetailsComplete()) {
                      navigate("/employee/details");
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
            <p className="text-sm font-semibold">Platform health</p>
            <p className="mt-2 text-xs leading-relaxed text-blue-100">
              All systems operational. Last sync: 2 min ago.
            </p>
            <button
              onClick={() => navigate("/employee/support")}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#071a3f]"
            >
              Start chat <ArrowRight size={14} />
            </button>
          </div>

          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="mt-6 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-200 hover:bg-red-500/10"
          >
            <LogOut size={17} />
            Logout
          </button>
        </aside>

        <main className="min-w-0">
          <header className="sticky top-0 z-10 border-b border-white/70 bg-white/85 px-4 py-4 backdrop-blur md:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#43567C]">Employee Portal</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                  Welcome back
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 md:flex">
                  <Search size={16} className="text-slate-400" />
                  <input
                    className="w-52 bg-transparent text-sm outline-none placeholder:text-slate-400"
                    placeholder="Search anything"
                  />
                </div>
                <button className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600">
                  <Bell size={17} />
                  <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500" />
                </button>
              </div>
            </div>
          </header>

          <div className="px-4 py-6 md:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;
