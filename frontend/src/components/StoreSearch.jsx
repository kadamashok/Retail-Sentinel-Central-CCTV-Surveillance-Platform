import { useState } from "react";

export default function StoreSearch({ onSearch, stores, onOpenCameras }) {
  const [filters, setFilters] = useState({ storeCode: "", storeName: "", city: "" });

  function submitSearch(e) {
    e.preventDefault();
    const query = [filters.storeCode, filters.storeName].filter(Boolean).join(" ").trim();
    onSearch({ query, city: filters.city });
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-base font-semibold text-enterprise-900">Quick Store Search</h3>
      <form onSubmit={submitSearch} className="mt-3 grid gap-3 md:grid-cols-4">
        <input
          value={filters.storeCode}
          onChange={(e) => setFilters((v) => ({ ...v, storeCode: e.target.value }))}
          placeholder="Store Code"
          className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
        />
        <input
          value={filters.storeName}
          onChange={(e) => setFilters((v) => ({ ...v, storeName: e.target.value }))}
          placeholder="Store Name"
          className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
        />
        <input
          value={filters.city}
          onChange={(e) => setFilters((v) => ({ ...v, city: e.target.value }))}
          placeholder="City"
          className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
        />
        <button className="rounded-md bg-enterprise-700 px-4 py-2 text-sm font-semibold text-white">Search Stores</button>
      </form>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {stores.map((store) => (
          <article key={store.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-semibold text-enterprise-900">{store.store_name}</p>
            <p className="text-xs text-slate-500">
              {store.store_code} | {store.city}
            </p>
            <button
              onClick={() => onOpenCameras(store)}
              className="mt-3 rounded-md bg-enterprise-500 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Open Cameras
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
