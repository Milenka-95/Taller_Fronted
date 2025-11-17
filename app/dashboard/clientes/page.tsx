"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"
import { safeConsole } from "@/lib/utils"
import type { Cliente } from "@/lib/types"
import { ClienteModal } from "./cliente-modal"
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

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null)
  const { toast } = useToast()

  const fetchClientes = async () => {
    try {
      const response = await api.get("/clientes")
      setClientes(response.data)
    } catch (error) {
      safeConsole.error("[v0] Error fetching clientes:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClientes()
  }, [])

  const handleCreate = () => {
    setSelectedCliente(null)
    setIsModalOpen(true)
  }

  const handleEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setIsModalOpen(true)
  }

  const handleDelete = (cliente: Cliente) => {
    setClienteToDelete(cliente)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!clienteToDelete) return

    try {
      await api.delete(`/clientes/${clienteToDelete.id}`)
      toast({
        title: "Cliente eliminado",
        description: "El cliente ha sido eliminado exitosamente",
      })
      fetchClientes()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setClienteToDelete(null)
    }
  }

  const columns = [
    {
      header: "RUC",
      accessor: "ruc" as keyof Cliente,
    },
    {
      header: "Razón Social",
      accessor: "razonSocial" as keyof Cliente,
    },
    {
      header: "Correo",
      accessor: "correo" as keyof Cliente,
    },
    {
      header: "Teléfono",
      accessor: "telefono" as keyof Cliente,
    },
    {
      header: "Estado",
      accessor: "estado" as keyof Cliente,
      cell: (value: boolean) => (
        <Badge variant={value ? "default" : "secondary"}>{value ? "Activo" : "Inactivo"}</Badge>
      ),
    },
    {
      header: "Acciones",
      accessor: ((row: Cliente) => (
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
          <h1 className="text-3xl font-bold tracking-tight text-balance">Clientes</h1>
          <p className="text-muted-foreground mt-2">Gestión de clientes del taller</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      <DataTable data={clientes} columns={columns} searchPlaceholder="Buscar clientes..." />

      <ClienteModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        cliente={selectedCliente}
        onSuccess={fetchClientes}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el cliente{" "}
              <strong>{clienteToDelete?.razonSocial}</strong>.
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
