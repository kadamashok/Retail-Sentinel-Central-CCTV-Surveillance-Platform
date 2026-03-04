import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Footer from "./Footer";
import Header from "./Header";
import Sidebar from "./Sidebar";

const allMenuItems = [
  { to: "/dashboard", label: "Dashboard", icon: "dashboard", adminOnly: false },
  { to: "/admin/stores", label: "Stores", icon: "stores", adminOnly: true },
  { to: "/admin/dvrs", label: "DVR Management", icon: "dvr", adminOnly: true },
  { to: "/monitoring", label: "Live Monitoring", icon: "monitoring", adminOnly: false },
  { to: "/admin/users", label: "Users", icon: "users", adminOnly: true },
  { to: "/admin/bulk-onboarding", label: "Bulk Onboarding", icon: "upload", adminOnly: true },
  { to: "/system-health", label: "System Health", icon: "health", adminOnly: false },
  { to: "/settings", label: "Settings", icon: "settings", adminOnly: false },
];

export default function AppShell({ children }) {
  const { role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = useMemo(
    () => allMenuItems.filter((item) => !(item.adminOnly && role !== "admin")),
    [role]
  );

  useEffect(() => {
    function syncSidebar() {
      setCollapsed(window.innerWidth < 1280);
    }
    syncSidebar();
    window.addEventListener("resize", syncSidebar);
    return () => window.removeEventListener("resize", syncSidebar);
  }, []);

  return (
    <div className="min-h-screen bg-enterprise-50 text-slate-900">
      <Sidebar
        items={menuItems}
        pathname={location.pathname}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className={`flex min-h-screen flex-col transition-all ${collapsed ? "lg:pl-[84px]" : "lg:pl-[240px]"}`}>
        <Header
          onOpenSidebar={() => setMobileOpen(true)}
          onSearch={(term) => {
            if (!term) return;
            navigate(`/monitoring?query=${encodeURIComponent(term)}`);
          }}
          onLogout={logout}
        />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
