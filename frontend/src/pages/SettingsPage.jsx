import { useState } from "react";

export default function SettingsPage() {
  const [form, setForm] = useState({
    alertEmail: "admin@retailsentinel.com",
    refreshSeconds: 15,
    enableSound: true,
  });

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-enterprise-900">Settings</h2>
      <section className="max-w-2xl rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Alert Email</span>
            <input
              value={form.alertEmail}
              onChange={(e) => setForm((v) => ({ ...v, alertEmail: e.target.value }))}
              className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Refresh Interval (seconds)</span>
            <input
              type="number"
              min={5}
              value={form.refreshSeconds}
              onChange={(e) => setForm((v) => ({ ...v, refreshSeconds: Number(e.target.value) }))}
              className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.enableSound}
              onChange={(e) => setForm((v) => ({ ...v, enableSound: e.target.checked }))}
            />
            Enable notification sound
          </label>
          <button className="rounded-md bg-enterprise-700 px-4 py-2 text-sm font-semibold text-white">Save Settings</button>
        </div>
      </section>
    </div>
  );
}
