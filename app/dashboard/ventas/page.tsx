"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { Plus, Eye, Trash2, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"
import type { Venta } from "@/lib/types"
import { VentaModal } from "./venta-modal"
import { VentaDetailModal } from "./venta-detail-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"

export default function VentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [ventaToDelete, setVentaToDelete] = useState<Venta | null>(null)
  const { toast } = useToast()

  const fetchVentas = async () => {
    try {
      const response = await api.get("/ventas")
      setVentas(response.data)
    } catch (error) {
      console.error("[v0] Error fetching ventas:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las ventas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVentas()
  }, [])

  const handleCreate = () => {
    setIsModalOpen(true)
  }

  const handleViewDetail = (venta: Venta) => {
    setSelectedVenta(venta)
    setIsDetailModalOpen(true)
  }

  const handleDelete = (venta: Venta) => {
    setVentaToDelete(venta)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!ventaToDelete) return

    try {
      await api.delete(`/ventas/${ventaToDelete.id}`)
      toast({
        title: "Venta eliminada",
        description: "La venta ha sido eliminada exitosamente",
      })
      fetchVentas()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la venta",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setVentaToDelete(null)
    }
  }

  const columns = [
    {
      header: "Fecha",
      accessor: "fecha" as keyof Venta,
      cell: (value: string) => new Date(value).toLocaleDateString("es-PE"),
    },
    {
      header: "Cliente",
      accessor: ((row: Venta) => row.cliente?.razonSocial || "N/A") as any,
    },
    {
      header: "Empleado",
      accessor: ((row: Venta) => row.empleado?.nombre || "N/A") as any,
    },
    {
      header: "Total",
      accessor: "total" as keyof Venta,
      cell: (value: number) => <span className="font-semibold">S/ {value.toFixed(2)}</span>,
    },
    {
      header: "Factura",
      accessor: ((row: Venta) =>
        row.factura ? (
          <Badge variant="default">
            <FileText className="mr-1 h-3 w-3" />
            {row.factura.numero}
          </Badge>
        ) : (
          <Badge variant="secondary">Sin factura</Badge>
        )) as any,
    },
    {
      header: "Items",
      accessor: ((row: Venta) => <Badge variant="outline">{row.detalles?.length || 0} productos</Badge>) as any,
    },
    {
      header: "Acciones",
      accessor: ((row: Venta) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleViewDetail(row)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(row)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      )) as any,
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">Ventas</h1>
          <p className="text-muted-foreground mt-2">Gestión de ventas y facturación</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Venta
        </Button>
      </div>

      <DataTable data={ventas} columns={columns} searchPlaceholder="Buscar ventas..." />

      <VentaModal open={isModalOpen} onOpenChange={setIsModalOpen} onSuccess={fetchVentas} />

      <VentaDetailModal open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen} venta={selectedVenta} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la venta y su factura asociada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
