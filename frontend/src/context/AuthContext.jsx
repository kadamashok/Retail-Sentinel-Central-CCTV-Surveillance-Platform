import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("rs_token"));
  const payload = token ? parseJwt(token) : null;

  const value = useMemo(
    () => ({
      token,
      role: payload?.role || null,
      userId: payload?.sub || null,
      login: (newToken) => {
        localStorage.setItem("rs_token", newToken);
        setToken(newToken);
      },
      logout: () => {
        localStorage.removeItem("rs_token");
        setToken(null);
      }
    }),
    [token, payload?.role, payload?.sub]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
