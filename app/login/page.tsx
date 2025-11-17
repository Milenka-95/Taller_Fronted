"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/lib/store"
import api from "@/lib/api"
import { Wrench } from "lucide-react"

export default function LoginPage() {
  const [correo, setCorreo] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const login = useAuthStore((state) => state.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await api.post("/auth/login", { correo, password })
      
      // Intentar diferentes formas de obtener el token
      const token = response.data?.token || 
                    response.data?.access_token || 
                    response.data?.accessToken ||
                    (typeof response.data === 'string' ? response.data : null)

      if (!token) {
        throw new Error("No se recibió token del servidor")
      }

      const usuario = {
        id: response.data.usuario?.id || response.data.id || "",
        nombre: response.data.usuario?.nombre || response.data.nombre || correo.split('@')[0],
        correo: correo,
        rol: response.data.usuario?.rol || response.data.rol || "usuario"
      }

      // Guardar en localStorage
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(usuario))
      
      // IMPORTANTE: Guardar en cookies para el middleware con secure flag en producción
      Cookies.set("auth-storage", token, { 
        expires: 7, // 7 días
        path: "/",
        sameSite: "strict",
        secure: process.env.NODE_ENV === 'production'
      })

      // Actualizar el store
      login(usuario, token)

      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${usuario.nombre}`,
      })

      // Redirigir al dashboard
      window.location.href = "/dashboard"
      
    } catch (error: any) {
      // Log errors in development only
      if (process.env.NODE_ENV === 'development') {
        console.error("Error en login:", error)
      }
      
      toast({
        title: "Error de autenticación",
        description: error.response?.data?.message || "Credenciales inválidas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-accent rounded-xl flex items-center justify-center">
            <Wrench className="w-8 h-8 text-accent-foreground" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-balance">MoDiesel</CardTitle>
            <CardDescription className="text-base mt-2">Sistema de Gestión de Taller</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="correo">Correo Electrónico</Label>
              <Input
                id="correo"
                name="correo"
                type="email"
                placeholder="usuario@modiesel.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}