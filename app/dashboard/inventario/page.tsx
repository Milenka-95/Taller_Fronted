"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { Plus, Edit, Trash2, TrendingUp, TrendingDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"
import type { Inventario } from "@/lib/types"
import { InventarioModal } from "./inventario-modal"
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

export default function InventarioPage() {
  const [inventario, setInventario] = useState<Inventario[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Inventario | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<Inventario | null>(null)
  const { toast } = useToast()

  const fetchInventario = async () => {
    try {
      const response = await api.get("/inventario")
      setInventario(response.data)
    } catch (error) {
      console.error("[v0] Error fetching inventario:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el inventario",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInventario()
  }, [])

  const handleCreate = () => {
    setSelectedItem(null)
    setIsModalOpen(true)
  }

  const handleEdit = (item: Inventario) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const handleDelete = (item: Inventario) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    try {
      await api.delete(`/inventario/${itemToDelete.id}`)
      toast({
        title: "Movimiento eliminado",
        description: "El movimiento de inventario ha sido eliminado exitosamente",
      })
      fetchInventario()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el movimiento",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  const columns = [
    {
      header: "Código",
      accessor: "codigo" as keyof Inventario,
    },
    {
      header: "Nombre",
      accessor: "nombre" as keyof Inventario,
    },
    {
      header: "Marca",
      accessor: "marca" as keyof Inventario,
    },
    {
      header: "Cantidad",
      accessor: "cantidad" as keyof Inventario,
      cell: (value: number) => <span className="font-semibold">{value}</span>,
    },
    {
      header: "Precio Unit.",
      accessor: "precioUnitario" as keyof Inventario,
      cell: (value: number) => `S/ ${value.toFixed(2)}`,
    },
    {
      header: "Precio Total",
      accessor: "precio" as keyof Inventario,
      cell: (value: number) => `S/ ${value.toFixed(2)}`,
    },
    {
      header: "Tipo Movimiento",
      accessor: "tipoMovimiento" as keyof Inventario,
      cell: (value: string) => (
        <Badge variant={value === "ENTRADA" ? "default" : "secondary"}>
          {value === "ENTRADA" ? (
            <>
              <TrendingUp className="mr-1 h-3 w-3" />
              Entrada
            </>
          ) : (
            <>
              <TrendingDown className="mr-1 h-3 w-3" />
              Salida
            </>
          )}
        </Badge>
      ),
    },
    {
      header: "Descripción",
      accessor: "descripcionMovimiento" as keyof Inventario,
      cell: (value: string) => <span className="line-clamp-1">{value}</span>,
    },
    {
      header: "Proveedor",
      accessor: ((row: Inventario) => row.proveedor?.nombre || "N/A") as any,
    },
    {
      header: "Acciones",
      accessor: ((row: Inventario) => (
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
          <h1 className="text-3xl font-bold tracking-tight text-balance">Inventario</h1>
          <p className="text-muted-foreground mt-2">Control de movimientos de inventario</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Movimiento
        </Button>
      </div>

      <DataTable data={inventario} columns={columns} searchPlaceholder="Buscar en inventario..." />

      <InventarioModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        inventario={selectedItem}
        onSuccess={fetchInventario}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el movimiento de inventario{" "}
              <strong>{itemToDelete?.codigo}</strong>.
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
