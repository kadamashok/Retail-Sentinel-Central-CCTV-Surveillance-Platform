import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { token, role: currentRole } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (role && role !== currentRole) return <Navigate to="/" replace />;
  return children;
}
