"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"
import { safeConsole } from "@/lib/utils"
import type { Proveedor } from "@/lib/types"
import { ProveedorModal } from "./proveedor-modal"
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

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [proveedorToDelete, setProveedorToDelete] = useState<Proveedor | null>(null)
  const { toast } = useToast()

  const fetchProveedores = async () => {
    try {
      const response = await api.get("/proveedores")
      setProveedores(response.data)
    } catch (error) {
      safeConsole.error("[v0] Error fetching proveedores:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los proveedores",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProveedores()
  }, [])

  const handleCreate = () => {
    setSelectedProveedor(null)
    setIsModalOpen(true)
  }

  const handleEdit = (proveedor: Proveedor) => {
    setSelectedProveedor(proveedor)
    setIsModalOpen(true)
  }

  const handleDelete = (proveedor: Proveedor) => {
    setProveedorToDelete(proveedor)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!proveedorToDelete) return

    try {
      await api.delete(`/proveedores/${proveedorToDelete.id}`)
      toast({
        title: "Proveedor eliminado",
        description: "El proveedor ha sido eliminado exitosamente",
      })
      fetchProveedores()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el proveedor",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setProveedorToDelete(null)
    }
  }

  const columns = [
    {
      header: "RUC",
      accessor: "ruc" as keyof Proveedor,
    },
    {
      header: "Nombre",
      accessor: "nombre" as keyof Proveedor,
    },
    {
      header: "Correo",
      accessor: "correo" as keyof Proveedor,
    },
    {
      header: "Teléfono",
      accessor: "telefono" as keyof Proveedor,
    },
    {
      header: "Dirección",
      accessor: "direccion" as keyof Proveedor,
    },
    {
      header: "Acciones",
      accessor: ((row: Proveedor) => (
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
          <h1 className="text-3xl font-bold tracking-tight text-balance">Proveedores</h1>
          <p className="text-muted-foreground mt-2">Gestión de proveedores de repuestos y productos</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Proveedor
        </Button>
      </div>

      <DataTable data={proveedores} columns={columns} searchPlaceholder="Buscar proveedores..." />

      <ProveedorModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        proveedor={selectedProveedor}
        onSuccess={fetchProveedores}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el proveedor{" "}
              <strong>{proveedorToDelete?.nombre}</strong>.
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
