import { create } from "zustand"
import { persist } from "zustand/middleware"
import Cookies from "js-cookie"
import type { Usuario } from "./types"

interface AuthState {
  user: Usuario | null
  token: string | null
  isAuthenticated: boolean
  login: (user: Usuario, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        localStorage.setItem("token", token)
        localStorage.setItem("user", JSON.stringify(user))
        
        // Guardar también en cookie para el middleware
        Cookies.set("auth-storage", token, { 
          expires: 7, 
          path: "/",
          sameSite: "lax"
        })
        
        set({ user, token, isAuthenticated: true })
      },
      logout: () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        
        // Limpiar también la cookie
        Cookies.remove("auth-storage", { path: "/" })
        
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)