import axios from "axios";
import router from "./router/router.ts"; // make sure you have a router instance
import AlertModal from "./components/AlertModal.vue";
import { showAlert } from "./alertService.ts";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // for HttpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;
