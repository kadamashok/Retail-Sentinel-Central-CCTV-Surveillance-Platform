import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ORIGIN, api } from "../api/client";
import CameraGrid from "../components/CameraGrid";
import DashboardCards from "../components/DashboardCards";
import StoreSearch from "../components/StoreSearch";

export default function DashboardPage() {
  const [stores, setStores] = useState([]);
  const [dvrs, setDvrs] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [grid, setGrid] = useState(4);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const [storeRes, dvrRes] = await Promise.all([api.get("/admin/stores"), api.get("/admin/dvrs")]);
        setStores(storeRes.data || []);
        setDvrs(dvrRes.data || []);
      } catch {
        const storeRes = await api.get("/monitoring/stores");
        setStores(storeRes.data || []);
      }
    }
    load();
  }, []);

  const stats = useMemo(() => {
    const allCameras = dvrs.flatMap((dvr) => dvr.cameras || []);
    const online = allCameras.filter((cam) => cam.status === "online").length;
    const offline = allCameras.filter((cam) => cam.status !== "online").length;
    return {
      stores: stores.length,
      dvrs: dvrs.length,
      cameras: allCameras.length,
      online,
      offline,
    };
  }, [stores, dvrs]);

  async function searchStores(filters) {
    const params = {};
    if (filters?.query) params.query = filters.query;
    if (filters?.city) params.city = filters.city;
    const { data } = await api.get("/monitoring/stores", { params });
    setStores(data);
  }

  async function openStoreCameras(store) {
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

  return (
    <div className="space-y-5">
      <DashboardCards stats={stats} />
      <StoreSearch
        onSearch={searchStores}
        stores={stores}
        onOpenCameras={(store) => {
          openStoreCameras(store);
          navigate(`/monitoring?store_code=${encodeURIComponent(store.store_code)}`);
        }}
      />
      <CameraGrid grid={grid} onChangeGrid={setGrid} cameras={cameras} />
    </div>
  );
}
