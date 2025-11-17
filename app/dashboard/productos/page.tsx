"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"
import { safeConsole } from "@/lib/utils"
import type { Producto } from "@/lib/types"
import { ProductoModal } from "./producto-modal"
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

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productoToDelete, setProductoToDelete] = useState<Producto | null>(null)
  const { toast } = useToast()

  const fetchProductos = async () => {
    try {
      const response = await api.get("/productos")
      setProductos(response.data)
    } catch (error) {
      safeConsole.error("[v0] Error fetching productos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProductos()
  }, [])

  const handleCreate = () => {
    setSelectedProducto(null)
    setIsModalOpen(true)
  }

  const handleEdit = (producto: Producto) => {
    setSelectedProducto(producto)
    setIsModalOpen(true)
  }

  const handleDelete = (producto: Producto) => {
    setProductoToDelete(producto)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!productoToDelete) return

    try {
      await api.delete(`/productos/${productoToDelete.id}`)
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado exitosamente",
      })
      fetchProductos()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setProductoToDelete(null)
    }
  }

  const columns = [
    {
      header: "Nombre",
      accessor: "nombre" as keyof Producto,
    },
    {
      header: "Marca",
      accessor: "marca" as keyof Producto,
    },
    {
      header: "Descripción",
      accessor: "descripcion" as keyof Producto,
      cell: (value: string) => <span className="line-clamp-2">{value}</span>,
    },
    {
      header: "Precio",
      accessor: "precio" as keyof Producto,
      cell: (value: number) => `S/ ${value.toFixed(2)}`,
    },
    {
      header: "Stock",
      accessor: "stock" as keyof Producto,
      cell: (value: number) => (
        <Badge variant={value > 10 ? "default" : value > 0 ? "secondary" : "destructive"}>{value}</Badge>
      ),
    },
    {
      header: "Proveedor",
      accessor: ((row: Producto) => row.proveedor?.nombre || "N/A") as any,
    },
    {
      header: "Acciones",
      accessor: ((row: Producto) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(row)}>
            <Edit className="h-4 w-4" />
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
          <h1 className="text-3xl font-bold tracking-tight text-balance">Productos</h1>
          <p className="text-muted-foreground mt-2">Gestión de productos y servicios del taller</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      <DataTable data={productos} columns={columns} searchPlaceholder="Buscar productos..." />

      <ProductoModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        producto={selectedProducto}
        onSuccess={fetchProductos}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el producto{" "}
              <strong>{productoToDelete?.nombre}</strong>.
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
