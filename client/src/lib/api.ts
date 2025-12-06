import axios from "axios";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const api = axios.create({
  baseURL: API_URL,
});

// Injecte automatiquement le token + collegeId
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {

    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const collegeId = localStorage.getItem("collegeId");
    if (collegeId) {
      config.headers["x-college-id"] = collegeId;
    }
  }

  return config;
});

// Gestion douce des erreurs 401
api.interceptors.response.use(
  (r) => r,
  (e) => {
    if (typeof window !== "undefined" && e?.response?.status === 401) {
      console.warn("Erreur 401 capturée par API:", e.response?.data?.message);
    }
    return Promise.reject(e);
  }
);
