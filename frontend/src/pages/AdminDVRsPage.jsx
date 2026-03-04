import { useEffect, useState } from "react";
import { API_ORIGIN, api } from "../api/client";

const initialForm = {
  store_code: "",
  dvr_ip: "",
  port: 554,
  username: "",
  password: "",
  dvr_model: "Hikvision",
  channels: 4
};

export default function AdminDVRsPage() {
  const [dvrs, setDvrs] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  async function loadDvrs() {
    const { data } = await api.get("/admin/dvrs");
    setDvrs(data);
  }

  useEffect(() => {
    loadDvrs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function addDvr(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/admin/dvrs", form);
      setForm(initialForm);
      loadDvrs();
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to add DVR");
    }
  }

  async function testConnectivity(id) {
    await api.post(`/admin/dvrs/${id}/test-connectivity`);
    loadDvrs();
  }

  async function autoDetect(id) {
    await api.post(`/admin/dvrs/${id}/auto-detect`);
    loadDvrs();
  }

  async function deleteDvr(id) {
    await api.delete(`/admin/dvrs/${id}`);
    loadDvrs();
  }

  async function editDvr(dvr) {
    const dvr_model = prompt("DVR model", dvr.dvr_model);
    const channels = prompt("Channels", String(dvr.channels));
    if (!dvr_model || !channels) return;
    await api.put(`/admin/dvrs/${dvr.id}`, {
      dvr_model,
      channels: Number(channels)
    });
    loadDvrs();
  }

  async function uploadCsv(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    await api.post("/admin/bulk-onboarding", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    loadDvrs();
  }

  async function downloadSampleTemplate() {
    try {
      setError("");
      const token = localStorage.getItem("rs_token");
      const response = await fetch(`${API_ORIGIN}/download-sample-store-template`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!response.ok) {
        throw new Error("Failed to download template");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "sample_store_onboarding_template.csv";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err?.message || "Failed to download template");
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-brand-900">DVR Management</h2>
          <button
            onClick={downloadSampleTemplate}
            className="rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white"
          >
            Download Sample Template
          </button>
        </div>
        <form className="mt-4 grid gap-3 md:grid-cols-4" onSubmit={addDvr}>
          {Object.entries(form).map(([key, value]) => (
            <input
              key={key}
              className="rounded-md border border-slate-300 px-3 py-2"
              placeholder={key}
              value={value}
              onChange={(e) =>
                setForm({ ...form, [key]: key === "channels" || key === "port" ? Number(e.target.value) : e.target.value })
              }
            />
          ))}
          <button className="rounded-md bg-accent px-4 py-2 font-semibold text-white">Add DVR</button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-4">
          <label className="text-sm font-semibold text-slate-700">Bulk onboarding (CSV)</label>
          <div className="mt-2">
            <button
              type="button"
              onClick={downloadSampleTemplate}
              className="rounded-md border border-brand-700 px-3 py-2 text-sm font-semibold text-brand-700"
            >
              Download Sample CSV
            </button>
          </div>
          <input type="file" accept=".csv" onChange={uploadCsv} className="mt-1 block text-sm" />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left text-slate-600">
              <tr>
                <th className="px-3 py-2">Store</th>
                <th className="px-3 py-2">Model</th>
                <th className="px-3 py-2">Channels</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dvrs.map((dvr) => (
                <tr key={dvr.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{dvr.store_code}</td>
                  <td className="px-3 py-2">{dvr.dvr_model}</td>
                  <td className="px-3 py-2">{dvr.channels}</td>
                  <td className="px-3 py-2 capitalize">{dvr.status}</td>
                  <td className="flex gap-2 px-3 py-2">
                    <button
                      onClick={() => testConnectivity(dvr.id)}
                      className="rounded bg-brand-700 px-2 py-1 text-xs text-white"
                    >
                      Test
                    </button>
                    <button
                      onClick={() => autoDetect(dvr.id)}
                      className="rounded bg-slate-700 px-2 py-1 text-xs text-white"
                    >
                      Detect
                    </button>
                    <button onClick={() => editDvr(dvr)} className="rounded bg-amber-600 px-2 py-1 text-xs text-white">
                      Edit
                    </button>
                    <button onClick={() => deleteDvr(dvr.id)} className="rounded bg-red-600 px-2 py-1 text-xs text-white">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
