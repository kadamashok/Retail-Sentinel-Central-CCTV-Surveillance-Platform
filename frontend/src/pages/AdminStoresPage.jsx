import { useEffect, useState } from "react";
import { api } from "../api/client";

const initialForm = { store_code: "", store_name: "", city: "", type: "store" };

export default function AdminStoresPage() {
  const [stores, setStores] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  async function fetchStores() {
    const { data } = await api.get("/admin/stores", { params: search ? { search } : {} });
    setStores(data);
  }

  useEffect(() => {
    fetchStores();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function addStore(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/admin/stores", form);
      setForm(initialForm);
      fetchStores();
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to create store");
    }
  }

  async function editStore(store) {
    const store_name = prompt("Store name", store.store_name);
    const city = prompt("City", store.city);
    if (!store_name || !city) return;
    await api.put(`/admin/stores/${store.id}`, { store_name, city });
    fetchStores();
  }

  async function deleteStore(id) {
    await api.delete(`/admin/stores/${id}`);
    fetchStores();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold text-brand-900">Store Management</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-4" onSubmit={addStore}>
          <input
            className="rounded-md border border-slate-300 px-3 py-2"
            placeholder="Store code"
            value={form.store_code}
            onChange={(e) => setForm({ ...form, store_code: e.target.value })}
          />
          <input
            className="rounded-md border border-slate-300 px-3 py-2"
            placeholder="Store name"
            value={form.store_name}
            onChange={(e) => setForm({ ...form, store_name: e.target.value })}
          />
          <input
            className="rounded-md border border-slate-300 px-3 py-2"
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
          <select
            className="rounded-md border border-slate-300 px-3 py-2"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="store">Store</option>
            <option value="warehouse">Warehouse</option>
          </select>
          <button className="rounded-md bg-accent px-4 py-2 font-semibold text-white md:col-span-1">
            Add Store
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex gap-2">
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            placeholder="Search by store code, name, city"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={fetchStores} className="rounded-md bg-brand-700 px-4 py-2 text-white">
            Search
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left text-slate-600">
              <tr>
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">City</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((s) => (
                <tr key={s.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{s.store_code}</td>
                  <td className="px-3 py-2">{s.store_name}</td>
                  <td className="px-3 py-2">{s.city}</td>
                  <td className="px-3 py-2 capitalize">{s.type}</td>
                  <td className="flex gap-2 px-3 py-2">
                    <button onClick={() => editStore(s)} className="rounded bg-amber-600 px-2 py-1 text-xs text-white">
                      Edit
                    </button>
                    <button onClick={() => deleteStore(s.id)} className="rounded bg-red-600 px-2 py-1 text-xs text-white">
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
