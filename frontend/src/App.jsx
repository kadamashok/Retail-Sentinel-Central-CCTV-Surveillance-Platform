import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import AdminDVRsPage from "./pages/AdminDVRsPage";
import AdminStoresPage from "./pages/AdminStoresPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import LoginPage from "./pages/LoginPage";
import ViewerMonitoringPage from "./pages/ViewerMonitoringPage";

function RootRedirect() {
  const { token, role } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (role === "admin") return <Navigate to="/admin/stores" replace />;
  return <Navigate to="/monitoring" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin/stores"
        element={
          <ProtectedRoute role="admin">
            <AppShell>
              <AdminStoresPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dvrs"
        element={
          <ProtectedRoute role="admin">
            <AppShell>
              <AdminDVRsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute role="admin">
            <AppShell>
              <AdminUsersPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/monitoring"
        element={
          <ProtectedRoute>
            <AppShell>
              <ViewerMonitoringPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
