const isBrowser = typeof window !== "undefined";
const localDevHost = isBrowser
  ? ["localhost", "127.0.0.1"].includes(window.location.hostname)
  : false;

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (localDevHost ? "http://127.0.0.1:5000" : "");

export const getAssetUrl = (path = "") => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE_URL}${path}`;
};
