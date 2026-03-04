import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { API_ORIGIN, api } from "../api/client";
import CameraGrid from "../components/CameraGrid";
import StoreSearch from "../components/StoreSearch";

export default function ViewerMonitoringPage() {
  const [stores, setStores] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [grid, setGrid] = useState(4);
  const [params] = useSearchParams();

  async function loadStores(filters = {}) {
    const paramsReq = {};
    if (filters.query) paramsReq.query = filters.query;
    if (filters.city) paramsReq.city = filters.city;
    const { data } = await api.get("/monitoring/stores", { params: paramsReq });
    setStores(data || []);
    return data || [];
  }

  async function loadCameras(store) {
    const { data } = await api.get(`/monitoring/stores/${store.store_code}/cameras`);
    const withStreams = await Promise.all(
      data.map(async (cam) => {
        const stream = await api.get(`/monitoring/streams/${cam.camera_id}`);
        return {
          ...cam,
          store_name: store.store_name,
          store_code: store.store_code,
          webrtc_url: `${API_ORIGIN}${stream.data.webrtc_url}`,
        };
      })
    );
    setCameras(withStreams);
  }

  useEffect(() => {
    async function init() {
      const query = params.get("query") || "";
      const city = params.get("city") || "";
      const storeCode = params.get("store_code");
      const loadedStores = await loadStores({ query, city });
      if (storeCode) {
        const match = loadedStores.find((store) => store.store_code === storeCode);
        if (match) {
          loadCameras(match);
        }
      }
    }
    init();
  }, [params]);

  return (
    <div className="space-y-5">
      <StoreSearch onSearch={loadStores} stores={stores} onOpenCameras={loadCameras} />
      <CameraGrid grid={grid} onChangeGrid={setGrid} cameras={cameras} />
    </div>
  );
}
