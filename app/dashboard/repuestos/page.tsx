"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"
import { safeConsole } from "@/lib/utils"
import type { Repuesto } from "@/lib/types"
import { RepuestoModal } from "./repuesto-modal"
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

export default function RepuestosPage() {
  const [repuestos, setRepuestos] = useState<Repuesto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRepuesto, setSelectedRepuesto] = useState<Repuesto | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [repuestoToDelete, setRepuestoToDelete] = useState<Repuesto | null>(null)
  const { toast } = useToast()

  const fetchRepuestos = async () => {
    try {
      const response = await api.get("/repuestos")
      setRepuestos(response.data)
    } catch (error) {
      safeConsole.error("[v0] Error fetching repuestos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los repuestos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRepuestos()
  }, [])

  const handleCreate = () => {
    setSelectedRepuesto(null)
    setIsModalOpen(true)
  }

  const handleEdit = (repuesto: Repuesto) => {
    setSelectedRepuesto(repuesto)
    setIsModalOpen(true)
  }

  const handleDelete = (repuesto: Repuesto) => {
    setRepuestoToDelete(repuesto)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!repuestoToDelete) return

    try {
      await api.delete(`/repuestos/${repuestoToDelete.id}`)
      toast({
        title: "Repuesto eliminado",
        description: "El repuesto ha sido eliminado exitosamente",
      })
      fetchRepuestos()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el repuesto",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setRepuestoToDelete(null)
    }
  }

  const columns = [
    {
      header: "Nombre",
      accessor: "nombre" as keyof Repuesto,
    },
    {
      header: "Marca",
      accessor: "marca" as keyof Repuesto,
    },
    {
      header: "Precio",
      accessor: "precio" as keyof Repuesto,
      cell: (value: number) => `S/ ${value.toFixed(2)}`,
    },
    {
      header: "Stock",
      accessor: "stock" as keyof Repuesto,
      cell: (value: number) => (
        <Badge variant={value > 10 ? "default" : value > 0 ? "secondary" : "destructive"}>{value}</Badge>
      ),
    },
    {
      header: "Proveedor",
      accessor: ((row: Repuesto) => row.proveedor?.nombre || "N/A") as any,
    },
    {
      header: "Vehículo",
      accessor: ((row: Repuesto) => row.vehiculo?.placa || "N/A") as any,
    },
    {
      header: "Acciones",
      accessor: ((row: Repuesto) => (
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
          <h1 className="text-3xl font-bold tracking-tight text-balance">Repuestos</h1>
          <p className="text-muted-foreground mt-2">Gestión de repuestos para maquinaria pesada</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Repuesto
        </Button>
      </div>

      <DataTable data={repuestos} columns={columns} searchPlaceholder="Buscar repuestos..." />

      <RepuestoModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        repuesto={selectedRepuesto}
        onSuccess={fetchRepuestos}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el repuesto{" "}
              <strong>{repuestoToDelete?.nombre}</strong>.
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
