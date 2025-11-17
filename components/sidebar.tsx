"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Truck,
  Package,
  Wrench,
  ShoppingCart,
  Receipt,
  ImageIcon,
  UserCog,
  Building2,
} from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Clientes",
    href: "/dashboard/clientes",
    icon: Users,
  },
  {
    title: "Vehículos",
    href: "/dashboard/vehiculos",
    icon: Truck,
  },
  {
    title: "Proveedores",
    href: "/dashboard/proveedores",
    icon: Building2,
  },
  {
    title: "Productos",
    href: "/dashboard/productos",
    icon: Package,
  },
  {
    title: "Repuestos",
    href: "/dashboard/repuestos",
    icon: Wrench,
  },
  {
    title: "Inventario",
    href: "/dashboard/inventario",
    icon: ShoppingCart,
  },
  {
    title: "Ventas",
    href: "/dashboard/ventas",
    icon: Receipt,
  },
  {
    title: "Imágenes",
    href: "/dashboard/imagenes",
    icon: ImageIcon,
  },
  {
    title: "Usuarios",
    href: "/dashboard/usuarios",
    icon: UserCog,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Wrench className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground">MoDiesel</h1>
            <p className="text-xs text-sidebar-foreground/60">Gestión de Taller</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.title}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </aside>
  )
}
