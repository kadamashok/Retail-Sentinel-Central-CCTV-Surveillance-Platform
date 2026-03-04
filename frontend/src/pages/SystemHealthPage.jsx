import { useEffect, useState } from "react";
import { API_ORIGIN } from "../api/client";

function HealthCard({ label, ok, detail }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">{label}</h3>
        <span
          className={`rounded-full px-2 py-1 text-xs font-semibold ${
            ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {ok ? "Healthy" : "Issue"}
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-600">{detail}</p>
    </article>
  );
}

export default function SystemHealthPage() {
  const [health, setHealth] = useState({
    backend: { ok: false, detail: "Checking..." },
    media: { ok: false, detail: "Checking..." },
    frontend: { ok: true, detail: "Frontend loaded successfully." },
  });

  useEffect(() => {
    async function check() {
      try {
        const backendRes = await fetch(`${API_ORIGIN}/health`);
        setHealth((prev) => ({
          ...prev,
          backend: {
            ok: backendRes.ok,
            detail: backendRes.ok ? "Backend API is reachable." : "Backend API returned an error.",
          },
        }));
      } catch {
        setHealth((prev) => ({ ...prev, backend: { ok: false, detail: "Backend API is unreachable." } }));
      }

      try {
        const mediaRes = await fetch("http://localhost:11984");
        setHealth((prev) => ({
          ...prev,
          media: { ok: mediaRes.ok, detail: mediaRes.ok ? "Media bridge is reachable." : "Media bridge error." },
        }));
      } catch {
        setHealth((prev) => ({ ...prev, media: { ok: false, detail: "Media bridge is unreachable." } }));
      }
    }

    check();
  }, []);

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-enterprise-900">System Health</h2>
      <section className="grid gap-4 md:grid-cols-3">
        <HealthCard label="Frontend" ok={health.frontend.ok} detail={health.frontend.detail} />
        <HealthCard label="Backend API" ok={health.backend.ok} detail={health.backend.detail} />
        <HealthCard label="Media Bridge" ok={health.media.ok} detail={health.media.detail} />
      </section>
    </div>
  );
}
