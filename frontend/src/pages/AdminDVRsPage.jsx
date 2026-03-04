import { useEffect, useState } from "react";
import { api } from "../api/client";

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

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold text-brand-900">DVR Management</h2>
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
