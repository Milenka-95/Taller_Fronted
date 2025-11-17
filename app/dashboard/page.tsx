"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Truck, Package, Receipt, TrendingUp, Wrench, Building2, ShoppingCart } from "lucide-react"
import api from "@/lib/api"
import { safeConsole } from "@/lib/utils"

interface DashboardStats {
  totalClientes: number
  totalVehiculos: number
  totalProductos: number
  totalVentas: number
  totalRepuestos: number
  totalProveedores: number
  ventasMes: number
  inventarioTotal: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalClientes: 0,
    totalVehiculos: 0,
    totalProductos: 0,
    totalVentas: 0,
    totalRepuestos: 0,
    totalProveedores: 0,
    ventasMes: 0,
    inventarioTotal: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
  safeConsole.log("=== DASHBOARD CARGANDO ===")
  
  // Verificar autenticación
  const token = localStorage.getItem("token")
  const user = localStorage.getItem("user")
  
  safeConsole.log("Token en localStorage:", token ? token.substring(0, 30) + "..." : "NO EXISTE")
  safeConsole.log("User en localStorage:", user)
  
  if (!token) {
    safeConsole.error("❌ No hay token, redirigiendo a login...")
    router.push("/login")
    return
  }

  safeConsole.log("✅ Token encontrado, cargando estadísticas...")

    const fetchStats = async () => {
      try {
        safeConsole.log("Obteniendo estadísticas del dashboard...")
        
        // Fetch stats from backend
        const [clientes, vehiculos, productos, ventas, repuestos, proveedores, inventario] = await Promise.all([
          api.get("/clientes").catch((err) => {
            safeConsole.error("Error obteniendo clientes:", err)
            return { data: [] }
          }),
          api.get("/vehiculos").catch((err) => {
            safeConsole.error("Error obteniendo vehiculos:", err)
            return { data: [] }
          }),
          api.get("/productos").catch((err) => {
            safeConsole.error("Error obteniendo productos:", err)
            return { data: [] }
          }),
          api.get("/ventas").catch((err) => {
            safeConsole.error("Error obteniendo ventas:", err)
            return { data: [] }
          }),
          api.get("/repuestos").catch((err) => {
            safeConsole.error("Error obteniendo repuestos:", err)
            return { data: [] }
          }),
          api.get("/proveedores").catch((err) => {
            safeConsole.error("Error obteniendo proveedores:", err)
            return { data: [] }
          }),
          api.get("/inventario").catch((err) => {
            safeConsole.error("Error obteniendo inventario:", err)
            return { data: [] }
          }),
        ])

        const currentMonth = new Date().getMonth()
        const ventasMesActual = ventas.data.filter((v: any) => {
          const ventaMonth = new Date(v.fecha).getMonth()
          return ventaMonth === currentMonth
        })

        setStats({
          totalClientes: clientes.data.length || 0,
          totalVehiculos: vehiculos.data.length || 0,
          totalProductos: productos.data.length || 0,
          totalVentas: ventas.data.length || 0,
          totalRepuestos: repuestos.data.length || 0,
          totalProveedores: proveedores.data.length || 0,
          ventasMes: ventasMesActual.length || 0,
          inventarioTotal: inventario.data.length || 0,
        })
        
        safeConsole.log("Estadísticas cargadas correctamente")
      } catch (error) {
        safeConsole.error("Error general obteniendo estadísticas:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [router])

  const cards = [
    {
      title: "Total Clientes",
      value: stats.totalClientes,
      icon: Users,
      description: "Clientes registrados",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Vehículos",
      value: stats.totalVehiculos,
      icon: Truck,
      description: "Vehículos en sistema",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Productos",
      value: stats.totalProductos,
      icon: Package,
      description: "Productos disponibles",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Ventas",
      value: stats.totalVentas,
      icon: Receipt,
      description: "Ventas realizadas",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Ventas del Mes",
      value: stats.ventasMes,
      icon: TrendingUp,
      description: "Ventas este mes",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Total Repuestos",
      value: stats.totalRepuestos,
      icon: Wrench,
      description: "Repuestos en stock",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
    },
    {
      title: "Total Proveedores",
      value: stats.totalProveedores,
      icon: Building2,
      description: "Proveedores activos",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Items Inventario",
      value: stats.inventarioTotal,
      icon: ShoppingCart,
      description: "Items en inventario",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-balance">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Resumen general del sistema MoDiesel</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <CardTitle>Bienvenido a MoDiesel</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Sistema integral de gestión para talleres de maquinaria pesada. Administra clientes, vehículos,
              inventario, ventas y más desde una sola plataforma moderna y eficiente.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-lg bg-accent/20">
                  <Users className="h-4 w-4 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Gestión de Clientes</p>
                  <p className="text-xs text-muted-foreground">Control completo de clientes y vehículos</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-lg bg-accent/20">
                  <Package className="h-4 w-4 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Inventario</p>
                  <p className="text-xs text-muted-foreground">Seguimiento de productos y repuestos</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-lg bg-accent/20">
                  <Receipt className="h-4 w-4 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Ventas y Facturación</p>
                  <p className="text-xs text-muted-foreground">Sistema completo de ventas</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-lg bg-accent/20">
                  <Building2 className="h-4 w-4 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Proveedores</p>
                  <p className="text-xs text-muted-foreground">Gestión de proveedores y compras</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accesos Rápidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            
            <a
              href="/dashboard/clientes"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Ver Clientes</span>
            </a>
            <a
              href="/dashboard/ventas"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Receipt className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Nueva Venta</span>
            </a>
            <a
              href="/dashboard/productos"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Package className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Ver Productos</span>
            </a>
            <a
              href="/dashboard/inventario"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Inventario</span>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}