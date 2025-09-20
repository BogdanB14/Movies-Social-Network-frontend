// src/api/http.js
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000",     // your Laravel base
  withCredentials: true                 // send/receive cookies
});

// Call this once before POST/PUT/PATCH/DELETE that need CSRF
export async function ensureCsrf() {
  // This sets XSRF-TOKEN cookie used by axios automatically
  await api.get("/sanctum/csrf-cookie");
}
