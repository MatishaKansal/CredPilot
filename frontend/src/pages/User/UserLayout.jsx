import { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard, User, FileText, Upload,
  ClipboardList, ShieldCheck, MessageCircle,
  Settings, LogOut, ChevronLeft, ChevronRight,
  Bell, Search,
} from "lucide-react";
import logo from "../../assets/logo.png";

const NAV_ITEMS = [
  { label: "Dashboard",         icon: LayoutDashboard, path: "/user/dashboard" },
  { label: "Profile",           icon: User,            path: "/user/profile" },
  { label: "Apply Loan",        icon: FileText,        path: "/user/apply-loan" },
  { label: "Upload Documents",  icon: Upload,          path: "/user/documents" },
  { label: "Loan Status",       icon: ClipboardList,   path: "/user/loan-status" },
  { label: "Eligibility Check", icon: ShieldCheck,     path: "/user/eligibility" },
  { label: "Chatbot",           icon: MessageCircle,   path: "/user/chatbot" },
  { label: "Settings",          icon: Settings,        path: "/user/settings" },
];

const UserLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const currentPage = NAV_ITEMS.find((n) => n.path === location.pathname)?.label ?? "Dashboard";

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#f4f6fb" }}>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        style={{
          width: collapsed ? 68 : 232,
          transition: "width 0.25s cubic-bezier(.4,0,.2,1)",
          background: "#0d1b4b",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {/* Logo row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: collapsed ? "20px 0" : "20px 18px",
            justifyContent: collapsed ? "center" : "flex-start",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            minHeight: 68,
          }}
        >
          <img src={logo} alt="CredPilot" style={{ width: 30, height: 30, objectFit: "contain", flexShrink: 0 }} />
          {!collapsed && (
            <span style={{ fontSize: 18, fontWeight: 700, whiteSpace: "nowrap", lineHeight: 1 }}>
              <span style={{ color: "#7c9bff" }}>Cred</span>
              <span style={{ color: "#fff" }}>Pilot</span>
            </span>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "12px 8px" }}>
          {!collapsed && (
            <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", padding: "6px 10px 10px" }}>
              Menu
            </p>
          )}
          {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                title={collapsed ? label : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: collapsed ? "10px 0" : "9px 12px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: 12,
                  marginBottom: 2,
                  textDecoration: "none",
                  fontSize: 13.5,
                  fontWeight: active ? 600 : 400,
                  color: active ? "#fff" : "rgba(255,255,255,0.45)",
                  background: active ? "rgba(124,155,255,0.18)" : "transparent",
                  transition: "all 0.15s",
                  position: "relative",
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; } }}
              >
                {active && (
                  <span style={{
                    position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                    width: 3, height: 18, background: "#7c9bff", borderRadius: "0 3px 3px 0",
                  }} />
                )}
                <Icon size={17} style={{ flexShrink: 0, color: active ? "#7c9bff" : "inherit" }} />
                {!collapsed && <span style={{ whiteSpace: "nowrap" }}>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: "8px 8px 16px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <button
            onClick={handleLogout}
            title={collapsed ? "Logout" : undefined}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              justifyContent: collapsed ? "center" : "flex-start",
              width: "100%", padding: collapsed ? "10px 0" : "9px 12px",
              borderRadius: 12, border: "none", cursor: "pointer",
              background: "transparent", color: "rgba(255,100,100,0.7)",
              fontSize: 13.5, fontWeight: 500, transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,80,80,0.12)"; e.currentTarget.style.color = "#ff6b6b"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,100,100,0.7)"; }}
          >
            <LogOut size={17} style={{ flexShrink: 0 }} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Right side ──────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, overflow: "hidden" }}>

        {/* Navbar */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#fff", borderBottom: "1px solid #eaecf5",
          padding: "0 28px", height: 64, flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{
                width: 34, height: 34, borderRadius: 10, border: "1px solid #eaecf5",
                background: "#f8f9fe", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#6b7280", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#eef1ff"; e.currentTarget.style.color = "#1565C0"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#f8f9fe"; e.currentTarget.style.color = "#6b7280"; }}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8f9fe", border: "1px solid #eaecf5", borderRadius: 12, padding: "8px 14px", width: 220 }}>
              <Search size={14} style={{ color: "#9ca3af", flexShrink: 0 }} />
              <input
                placeholder="Search..."
                style={{ border: "none", outline: "none", background: "transparent", fontSize: 13, color: "#374151", width: "100%" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Breadcrumb */}
            <span style={{ fontSize: 13, color: "#9ca3af", marginRight: 4 }}>
              User / <span style={{ color: "#1565C0", fontWeight: 500 }}>{currentPage}</span>
            </span>

            {/* Bell */}
            <button style={{
              position: "relative", width: 36, height: 36, borderRadius: 10,
              border: "1px solid #eaecf5", background: "#f8f9fe",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#6b7280",
            }}>
              <Bell size={16} />
              <span style={{
                position: "absolute", top: 7, right: 7, width: 7, height: 7,
                background: "#ef4444", borderRadius: "50%", border: "1.5px solid #fff",
              }} />
            </button>

            {/* Divider */}
            <div style={{ width: 1, height: 28, background: "#eaecf5" }} />

            {/* Avatar */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "linear-gradient(135deg, #1565C0, #1a237e)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0,
              }}>
                RK
              </div>
              <div style={{ lineHeight: 1.3 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0 }}>Rahul Kumar</p>
                <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>Applicant</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;