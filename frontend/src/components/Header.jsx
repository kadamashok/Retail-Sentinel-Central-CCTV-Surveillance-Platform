import { useState } from "react";

export default function Header({ onOpenSidebar, onSearch, onLogout }) {
  const [term, setTerm] = useState("");
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="rounded-md border border-slate-300 p-2 text-slate-600 lg:hidden"
            title="Open menu"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <img src="/assets/logo.png" alt="Croma Logo" className="h-10 w-auto" />
          <div>
            <h1 className="text-sm font-bold text-enterprise-900 lg:text-base">
              Retail Sentinel - Central CCTV Surveillance Platform
            </h1>
            <p className="text-xs text-slate-500">Enterprise Monitoring Console</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSearch(term);
            }}
            className="hidden items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-3 py-1.5 lg:flex"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
            </svg>
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search store code"
              className="w-48 bg-transparent text-sm outline-none"
            />
          </form>

          <button className="relative rounded-md border border-slate-300 p-2 text-slate-600 hover:bg-slate-100">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 01-6 0" />
            </svg>
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <div className="relative">
            <button
              onClick={() => setOpenMenu((v) => !v)}
              className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-enterprise-700 text-xs text-white">
                AK
              </span>
              <span className="hidden lg:inline">Admin User</span>
            </button>
            {openMenu && (
              <div className="absolute right-0 mt-2 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                <button className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-slate-100">Profile</button>
                <button className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-slate-100">
                  Change Password
                </button>
                <button
                  onClick={onLogout}
                  className="block w-full rounded px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
