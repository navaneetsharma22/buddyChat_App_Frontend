const isBrowser = typeof window !== "undefined";
const localDevHost = isBrowser
  ? ["localhost", "127.0.0.1"].includes(window.location.hostname)
  : false;

const DEFAULT_LOCAL_API_BASE_URL = "http://127.0.0.1:5000";
const DEFAULT_PRODUCTION_API_BASE_URL =
  "https://buddychat-app-backend.onrender.com";

const normalizeBaseUrl = (value = "") => value.replace(/\/+$/, "");

export const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL ||
    (localDevHost
      ? DEFAULT_LOCAL_API_BASE_URL
      : DEFAULT_PRODUCTION_API_BASE_URL)
);

export const getAssetUrl = (path = "") => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE_URL}${path}`;
};
