import { useMemo, useState } from "react";
import { API_ORIGIN, api } from "../api/client";

export default function BulkOnboardingPage() {
  const [file, setFile] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);
  const [previewHeaders, setPreviewHeaders] = useState([]);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const hasPreview = useMemo(() => previewHeaders.length > 0 && previewRows.length > 0, [previewHeaders, previewRows]);

  function parseCsvPreview(content) {
    const lines = content.split(/\r?\n/).filter(Boolean);
    if (!lines.length) return;
    const headers = lines[0].split(",").map((v) => v.trim());
    const rows = lines.slice(1, 7).map((line) => line.split(",").map((v) => v.trim()));
    setPreviewHeaders(headers);
    setPreviewRows(rows);
  }

  async function onFileChange(event) {
    const selected = event.target.files?.[0];
    setFile(selected || null);
    setMessage("");
    setError("");
    setProgress(0);
    if (!selected) return;
    const text = await selected.text();
    parseCsvPreview(text);
  }

  async function downloadSample() {
    const token = localStorage.getItem("rs_token");
    const response = await fetch(`${API_ORIGIN}/download-sample-store-template`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      throw new Error("Failed to download sample CSV");
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_store_onboarding_template.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }

  async function uploadCsv() {
    if (!file) return;
    setError("");
    setMessage("");
    setProgress(0);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const { data } = await api.post("/admin/bulk-onboarding", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          const pct = evt.total ? Math.round((evt.loaded * 100) / evt.total) : 0;
          setProgress(pct);
        },
      });
      setMessage(`Uploaded successfully. Stores: ${data.stores_created}, DVRs: ${data.dvrs_created}`);
    } catch (err) {
      setError(err?.response?.data?.detail || "Upload failed");
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-enterprise-900">Bulk Onboarding</h2>
        <p className="mt-1 text-sm text-slate-600">Upload onboarding CSV for stores and DVRs.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
            Upload CSV
            <input type="file" accept=".csv" onChange={onFileChange} className="hidden" />
          </label>
          <button
            onClick={downloadSample}
            className="rounded-md border border-enterprise-700 px-3 py-2 text-sm font-semibold text-enterprise-700"
          >
            Download Sample CSV
          </button>
          <button
            onClick={uploadCsv}
            disabled={!file}
            className="rounded-md bg-enterprise-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Upload
          </button>
          {file && <span className="text-sm text-slate-600">{file.name}</span>}
        </div>

        <div className="mt-4">
          <div className="h-2 w-full rounded-full bg-slate-200">
            <div className="h-2 rounded-full bg-enterprise-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1 text-xs text-slate-500">Upload progress: {progress}%</p>
        </div>

        {message && <p className="mt-3 text-sm text-green-700">{message}</p>}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-enterprise-900">CSV Preview</h3>
        {hasPreview ? (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-left text-slate-700">
                <tr>
                  {previewHeaders.map((header) => (
                    <th key={header} className="px-3 py-2">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    {row.map((value, colIdx) => (
                      <td key={`${idx}-${colIdx}`} className="px-3 py-2 text-slate-700">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">No CSV selected yet.</p>
        )}
      </section>
    </div>
  );
}
