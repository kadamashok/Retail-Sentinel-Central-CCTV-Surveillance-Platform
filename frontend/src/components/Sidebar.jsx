import { Link } from "react-router-dom";

function Icon({ d }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const iconMap = {
  dashboard: "M3 12h8V3H3v9zm10 9h8v-6h-8v6zM3 21h8v-6H3v6zm10-8h8V3h-8v10z",
  stores: "M4 7h16M6 7V5h12v2m-1 0v12H7V7m3 4h4m-4 4h4",
  dvr: "M4 6h16v8H4zM7 18h10m-8-4h.01m2 0h.01",
  monitoring: "M3 12s3-6 9-6 9 6 9 6-3 6-9 6-9-6-9-6zm9 3a3 3 0 100-6 3 3 0 000 6z",
  users: "M16 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2m16 0h2v-2a4 4 0 00-3-3.87M16 3.13A4 4 0 0119 7v1m-7 0a4 4 0 10-8 0 4 4 0 008 0z",
  upload: "M12 16V4m0 0l-4 4m4-4l4 4M4 16v3h16v-3",
  health: "M20 6L9 17l-5-5",
  settings: "M12 8a4 4 0 100 8 4 4 0 000-8zm0-5v2m0 14v2m9-9h-2M5 12H3m15.36 6.36l-1.41-1.41M7.05 7.05 5.64 5.64m12.72 0l-1.41 1.41M7.05 16.95l-1.41 1.41",
};

export default function Sidebar({ items, pathname, collapsed, mobileOpen, onToggleCollapse, onCloseMobile }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-20 bg-slate-900/40 lg:hidden ${mobileOpen ? "block" : "hidden"}`}
        onClick={onCloseMobile}
      />
      <aside
        className={`fixed left-0 top-0 z-30 h-screen border-r border-white/10 bg-enterprise-900 text-white transition-all duration-200 ${
          collapsed ? "w-[84px]" : "w-[240px]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <div className={`${collapsed ? "hidden" : "block"} text-sm font-semibold text-enterprise-100`}>Navigation</div>
          <button
            onClick={onToggleCollapse}
            className="rounded-md border border-enterprise-700 p-2 text-enterprise-100 hover:bg-enterprise-700"
            title="Toggle sidebar"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <nav className="space-y-1 px-3 py-2">
          {items.map((item) => {
            const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  active ? "bg-enterprise-500 text-white shadow" : "text-enterprise-100 hover:bg-enterprise-700"
                }`}
                title={item.label}
              >
                <Icon d={iconMap[item.icon] || iconMap.settings} />
                <span className={`${collapsed ? "hidden" : "block"}`}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
