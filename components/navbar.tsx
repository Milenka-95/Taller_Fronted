"use client"

import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuthStore } from "@/lib/store"
import { LogOut } from "lucide-react"

export function Navbar() {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    console.log("🚪 Cerrando sesión...")
    
    // Limpiar el store (que ya limpia localStorage)
    logout()
    
    // IMPORTANTE: Limpiar la cookie que usa el middleware
    Cookies.remove("auth-storage", { path: "/" })
    
    console.log("✅ Sesión cerrada")
    
    // Usar window.location para forzar recarga completa
    window.location.href = "/login"
  }

  const initials =
    user?.nombre
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"

  // ... resto de tu código del navbar

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-foreground">Sistema de Gestión</h2>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-accent text-accent-foreground">{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.nombre}</p>
              <p className="text-xs leading-none text-muted-foreground">{user?.correo}</p>
              <p className="text-xs leading-none text-muted-foreground mt-1">
                <span className="inline-flex items-center rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent-foreground">
                  {user?.rol}
                </span>
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar Sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
