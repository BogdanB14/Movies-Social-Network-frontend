// /src/axios.js
import axios from "axios";

axios.defaults.baseURL = "http://localhost:8000";
axios.defaults.withCredentials = true;

// (Optional – not relied on for CORS, but fine to keep)
axios.defaults.xsrfCookieName = "XSRF-TOKEN";
axios.defaults.xsrfHeaderName = "X-XSRF-TOKEN";

// Helper to read a cookie
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

// Force-add XSRF header for CORS requests (Axios won't by default)
axios.interceptors.request.use((config) => {
  const token = getCookie("XSRF-TOKEN");
  if (token) {
    // decodeURIComponent because Laravel URL-encodes the cookie value
    config.headers["X-XSRF-TOKEN"] = decodeURIComponent(token);
  }
  return config;
});

export default axios;
