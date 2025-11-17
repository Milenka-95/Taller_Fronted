import axios from "axios"
import Cookies from "js-cookie"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor de solicitudes (agrega token JWT)
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // Intentar obtener token de localStorage primero, luego de cookies
      const token = localStorage.getItem("token") || Cookies.get("auth-storage")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor de respuestas (manejo de errores)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        Cookies.remove("auth-storage", { path: "/" })
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)

export default api