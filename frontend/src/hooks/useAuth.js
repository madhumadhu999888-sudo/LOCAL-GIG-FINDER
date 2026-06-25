import { useState, useEffect, useCallback } from "react";
import { api, getToken, setToken, clearToken } from "../utils/api.js";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const t = getToken();
    if (!t) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api("/api/auth/me");
      setUser(data.user);
    } catch (e) {
      if (e?.isNetworkError) {
        setUser(null);
        return;
      }
      if (e?.status === 401) {
        clearToken();
        setUser(null);
        return;
      }
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = (token, u) => {
    setToken(token);
    setUser(u);
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return { user, loading, refresh, login, logout };
}
