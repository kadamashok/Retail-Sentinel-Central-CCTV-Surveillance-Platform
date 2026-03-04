import { useEffect, useState } from "react";
import { API_ORIGIN, api } from "../api/client";

const gridColsMap = {
  4: "grid-cols-2",
  9: "grid-cols-3",
  16: "grid-cols-4"
};

export default function ViewerMonitoringPage() {
  const [stores, setStores] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedStore, setSelectedStore] = useState("");
  const [cameras, setCameras] = useState([]);
  const [grid, setGrid] = useState(4);

  async function loadStores() {
    const { data } = await api.get("/monitoring/stores", { params: query ? { query } : {} });
    setStores(data);
  }

  useEffect(() => {
    loadStores();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadCameras(storeCode) {
    setSelectedStore(storeCode);
    const { data } = await api.get(`/monitoring/stores/${storeCode}/cameras`);
    const withStreams = await Promise.all(
      data.map(async (cam) => {
        const stream = await api.get(`/monitoring/streams/${cam.camera_id}`);
        return { ...cam, webrtc_url: `${API_ORIGIN}${stream.data.webrtc_url}` };
      })
    );
    setCameras(withStreams);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold text-brand-900">Live Monitoring Dashboard</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <input
            className="min-w-64 flex-1 rounded-md border border-slate-300 px-3 py-2"
            placeholder="Search by store code/name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={loadStores} className="rounded-md bg-brand-700 px-4 py-2 text-white">
            Search
          </button>
          <select
            value={grid}
            onChange={(e) => setGrid(Number(e.target.value))}
            className="rounded-md border border-slate-300 px-3 py-2"
          >
            <option value={4}>4 Grid</option>
            <option value={9}>9 Grid</option>
            <option value={16}>16 Grid</option>
          </select>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {stores.map((store) => (
            <button
              key={store.id}
              onClick={() => loadCameras(store.store_code)}
              className={`rounded-full border px-3 py-1 text-sm ${
                selectedStore === store.store_code
                  ? "border-brand-700 bg-brand-100 text-brand-900"
                  : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              {store.store_code} | {store.city}
            </button>
          ))}
        </div>
      </section>

      <section className={`grid gap-4 ${gridColsMap[grid]} rounded-xl`}>
        {cameras.slice(0, grid).map((cam) => (
          <article key={cam.camera_id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">{cam.camera_name}</span>
              <span className={cam.status === "online" ? "text-green-600" : "text-red-600"}>
                {cam.status?.toUpperCase() || "UNKNOWN"}
              </span>
            </div>
            <iframe
              title={`cam-${cam.camera_id}`}
              src={cam.webrtc_url}
              className="h-44 w-full rounded border border-slate-200"
              allow="autoplay; fullscreen"
            />
          </article>
        ))}
      </section>
    </div>
  );
}
