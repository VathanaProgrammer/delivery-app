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

// Add a global response interceptor
API.interceptors.response.use(
  (response) => response, // just return successful responses
  (error) => {
    if (error.response?.status === 401) {
      console.log(error)
      // Session expired
      showAlert({
        type: "error",
        messageKey: "sessionExpired" 
      });
      router.push({ name: "SignIn" }); 
    }
    return Promise.reject(error);
  }
);

export default API;
