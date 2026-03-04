import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import AdminDVRsPage from "./pages/AdminDVRsPage";
import AdminStoresPage from "./pages/AdminStoresPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import BulkOnboardingPage from "./pages/BulkOnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import SystemHealthPage from "./pages/SystemHealthPage";
import ViewerMonitoringPage from "./pages/ViewerMonitoringPage";

function RootRedirect() {
  const { token, role } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (role === "admin") return <Navigate to="/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppShell>
              <DashboardPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
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
        path="/admin/bulk-onboarding"
        element={
          <ProtectedRoute role="admin">
            <AppShell>
              <BulkOnboardingPage />
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
      <Route
        path="/system-health"
        element={
          <ProtectedRoute>
            <AppShell>
              <SystemHealthPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AppShell>
              <SettingsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
