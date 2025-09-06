// src/lib/api.ts
export const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL ?? "").replace(/\/$/, "");

/**
 * Builds a full URL from a relative path.
 * Use like: apiUrl("/product?id=123")
 */
export const apiUrl = (path: string) => {
  if (!path.startsWith("/")) path = "/" + path;
  return `${API_BASE_URL}${path}`;
};
