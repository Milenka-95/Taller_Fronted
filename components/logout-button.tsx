"use client"

import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useAuthStore } from "@/lib/store"

export function LogoutButton() {
  const router = useRouter()
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    console.log("🚪 Cerrando sesión...")
    
    // Limpiar localStorage
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    
    // Limpiar cookie
    Cookies.remove("auth-storage", { path: "/" })
    
    console.log("✅ Datos limpiados")
    
    // Limpiar store
    logout()
    
    // Usar window.location para forzar recarga completa
    console.log("🔄 Redirigiendo a login...")
    window.location.href = "/login"
  }

  return (
    <Button onClick={handleLogout} variant="ghost" size="sm">
      <LogOut className="h-4 w-4 mr-2" />
      Cerrar Sesión
    </Button>
  )
}