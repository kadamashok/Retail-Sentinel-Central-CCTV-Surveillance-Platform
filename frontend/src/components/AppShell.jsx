import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const adminLinks = [
  { to: "/admin/stores", label: "Stores" },
  { to: "/admin/dvrs", label: "DVRs" },
  { to: "/admin/users", label: "Users" }
];

export default function AppShell({ children }) {
  const { role, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-brand-50 via-white to-slate-100">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img src="/assets/logo.png" alt="Croma Logo" className="h-10 w-auto" />
            <div>
              <h1 className="text-xl font-extrabold text-brand-900">
                Retail Sentinel - Central CCTV Surveillance Platform
              </h1>
              <p className="text-xs text-slate-500">Enterprise CCTV Operations Console</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="rounded-md bg-brand-700 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-900"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-6">
        <aside className="w-56 rounded-xl border border-slate-200 bg-white p-4">
          {role === "admin" ? (
            <nav className="space-y-2">
              {adminLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block rounded-md px-3 py-2 text-sm ${
                    location.pathname.startsWith(link.to)
                      ? "bg-brand-100 font-semibold text-brand-900"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/monitoring"
                className={`block rounded-md px-3 py-2 text-sm ${
                  location.pathname.startsWith("/monitoring")
                    ? "bg-brand-100 font-semibold text-brand-900"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                Monitoring
              </Link>
            </nav>
          ) : (
            <nav>
              <Link
                to="/monitoring"
                className={`block rounded-md px-3 py-2 text-sm ${
                  location.pathname.startsWith("/monitoring")
                    ? "bg-brand-100 font-semibold text-brand-900"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                Monitoring
              </Link>
            </nav>
          )}
        </aside>
        <main className="flex-1">{children}</main>
      </div>
      <footer className="mt-auto border-t border-slate-200 bg-white/70 px-6 py-4 text-center text-xs text-slate-600">
        <p>Retail Sentinel CCTV Platform</p>
        <p>Developed by Ashok Kadam using AI with guidance from his son Swarup.</p>
      </footer>
    </div>
  );
}
