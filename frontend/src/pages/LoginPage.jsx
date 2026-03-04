import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@retailsentinel.com");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function getErrorMessage(err) {
    const detail = err?.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0];
      if (typeof first === "string") return first;
      if (first?.msg) return first.msg;
    }
    return "Login failed";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.access_token);
      navigate("/monitoring");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,#d9e8e6,transparent_45%),linear-gradient(180deg,#f8fafc,#eef2f7)] p-6">
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
          <p className="mb-2 inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-900">
            Enterprise CCTV
          </p>
          <h1 className="text-2xl font-extrabold text-brand-900">Retail Sentinel</h1>
          <p className="mt-2 text-sm text-slate-600">Secure access for Admin and CBO viewers</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              placeholder="Email"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              placeholder="Password"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              disabled={loading}
              className="w-full rounded-md bg-brand-700 py-2 font-semibold text-white hover:bg-brand-900 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
      <footer className="pt-4 text-center text-xs text-slate-600">
        <p>Retail Sentinel CCTV Platform</p>
        <p>Developed by Ashok Kadam using AI with guidance from his son Swarup.</p>
      </footer>
    </div>
  );
}
