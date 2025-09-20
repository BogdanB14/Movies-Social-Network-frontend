// /src/axios.js
import axios from "axios";

axios.defaults.baseURL = "http://localhost:8000"; // your Laravel base
axios.defaults.withCredentials = true;            // send cookies
axios.defaults.xsrfCookieName = "XSRF-TOKEN";
axios.defaults.xsrfHeaderName = "X-XSRF-TOKEN";

export default axios;
