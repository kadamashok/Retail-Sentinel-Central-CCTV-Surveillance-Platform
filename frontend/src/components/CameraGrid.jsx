const gridClassMap = {
  4: "md:grid-cols-2",
  9: "md:grid-cols-3",
  16: "md:grid-cols-4",
};

export default function CameraGrid({ grid, onChangeGrid, cameras }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-enterprise-900">Live Monitoring</h3>
        <div className="inline-flex rounded-lg border border-slate-300 bg-slate-50 p-1">
          {[4, 9, 16].map((value) => (
            <button
              key={value}
              onClick={() => onChangeGrid(value)}
              className={`rounded px-3 py-1 text-sm ${
                grid === value ? "bg-enterprise-700 text-white" : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              {value} Cameras
            </button>
          ))}
        </div>
      </div>
      <div className={`grid grid-cols-1 gap-4 ${gridClassMap[grid]}`}>
        {cameras.slice(0, grid).map((cam) => {
          const online = cam.status === "online";
          return (
            <article key={cam.camera_id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{cam.camera_name}</p>
                  <p className="text-xs text-slate-500">{cam.store_name || cam.store_code || "Unknown Store"}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                    online ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${online ? "bg-green-500" : "bg-red-500"}`} />
                  {online ? "Online" : "Offline"}
                </span>
              </div>
              <iframe
                title={`camera-${cam.camera_id}`}
                src={cam.webrtc_url}
                className="h-44 w-full rounded-md border border-slate-200 bg-black"
                allow="autoplay; fullscreen"
              />
            </article>
          );
        })}
      </div>
      {cameras.length === 0 && (
        <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
          No cameras loaded. Select a store to view live streams.
        </div>
      )}
    </section>
  );
}
