const base = import.meta.env.VITE_API_URL || "";

export const getToken = () => localStorage.getItem("token");
export const setToken = (t) => localStorage.setItem("token", t);
export const clearToken = () => localStorage.removeItem("token");

const networkHelp =
  "Cannot reach the API. Start the backend (npm run dev from project root) and ensure MongoDB is running with MONGO_URI set in backend/.env.";

export async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  let res;
  try {
    res = await fetch(`${base}${path}`, {
      ...options,
      headers,
    });
  } catch (e) {
    const err = new Error(networkHelp);
    err.isNetworkError = true;
    err.cause = e;
    throw err;
  }

  let data;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text || "Invalid response" };
  }

  if (!res.ok) {
    const err = new Error(data.message || res.statusText || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
