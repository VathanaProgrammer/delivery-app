import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // for httpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// The browser will send httpOnly cookies automatically

export default API;
