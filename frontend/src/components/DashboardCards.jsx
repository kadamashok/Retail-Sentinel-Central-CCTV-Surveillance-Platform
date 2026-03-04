const cardConfig = [
  { key: "stores", label: "Total Stores", color: "bg-enterprise-700", icon: "M4 7h16M6 7V5h12v2m-1 0v12H7V7" },
  { key: "dvrs", label: "Total DVRs", color: "bg-enterprise-500", icon: "M4 6h16v8H4zM7 18h10" },
  { key: "cameras", label: "Total Cameras", color: "bg-status-warning", icon: "M3 12s3-6 9-6 9 6 9 6-3 6-9 6-9-6-9-6z" },
  { key: "online", label: "Online Cameras", color: "bg-status-healthy", icon: "M20 6L9 17l-5-5" },
  { key: "offline", label: "Offline Cameras", color: "bg-status-offline", icon: "M6 6l12 12M18 6L6 18" },
];

function CardIcon({ d }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function DashboardCards({ stats }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cardConfig.map((card) => (
        <article key={card.key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">{card.label}</p>
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}>
              <CardIcon d={card.icon} />
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-enterprise-900">{stats[card.key] ?? 0}</p>
        </article>
      ))}
    </section>
  );
}
