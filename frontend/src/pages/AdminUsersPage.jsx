import { useEffect, useState } from "react";
import { api } from "../api/client";

const initialForm = {
  email: "",
  full_name: "",
  password: "",
  role: "viewer"
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  async function loadUsers() {
    const { data } = await api.get("/admin/users");
    setUsers(data);
  }

  useEffect(() => {
    loadUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function createUser(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/admin/users", form);
      setForm(initialForm);
      loadUsers();
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to create user");
    }
  }

  async function resetPassword(id) {
    const newPassword = prompt("Enter new password");
    if (!newPassword) return;
    await api.post(`/admin/users/${id}/reset-password`, { new_password: newPassword });
    loadUsers();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold text-brand-900">User Management</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-4" onSubmit={createUser}>
          <input
            className="rounded-md border border-slate-300 px-3 py-2"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="rounded-md border border-slate-300 px-3 py-2"
            placeholder="Full name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
          <input
            type="password"
            className="rounded-md border border-slate-300 px-3 py-2"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <select
            className="rounded-md border border-slate-300 px-3 py-2"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="viewer">Viewer</option>
            <option value="admin">Admin</option>
          </select>
          <button className="rounded-md bg-accent px-4 py-2 font-semibold text-white">Create User</button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left text-slate-600">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-100">
                <td className="px-3 py-2">{u.full_name}</td>
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2 capitalize">{u.role}</td>
                <td className="px-3 py-2">
                  <button onClick={() => resetPassword(u.id)} className="rounded bg-brand-700 px-2 py-1 text-xs text-white">
                    Reset Password
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
