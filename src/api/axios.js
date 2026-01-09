import axios from "axios";

const api = axios.create({
  baseURL:import.meta.env.VITE_API_URL, // 🔁 change to prod later
  headers: {
    "Content-Type": "application/json",
  },
  //timeout: 15000,
});

// Optional: auth interceptor (later)
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

export default api;
