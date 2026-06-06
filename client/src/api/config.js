// Centralized client configuration sourced from Vite env vars.
// All VITE_* vars are statically replaced at build time.

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const WS_URL = import.meta.env.VITE_WS_URL || API_URL;
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "";

export const hasGoogle = Boolean(GOOGLE_CLIENT_ID);
export const hasCloudinary = Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET);

export const TOKEN_KEY = "auth-token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
export const isLoggedIn = () => Boolean(getToken());
