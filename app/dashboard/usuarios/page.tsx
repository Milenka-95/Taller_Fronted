"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"
import { safeConsole } from "@/lib/utils"
import type { Usuario } from "@/lib/types"
import { UsuarioModal } from "./usuario-modal"
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

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [usuarioToDelete, setUsuarioToDelete] = useState<Usuario | null>(null)
  const { toast } = useToast()

  const fetchUsuarios = async () => {
    try {
      const response = await api.get("/usuarios")
      setUsuarios(response.data)
    } catch (error) {
      safeConsole.error("[v0] Error fetching usuarios:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const handleCreate = () => {
    setSelectedUsuario(null)
    setIsModalOpen(true)
  }

  const handleEdit = (usuario: Usuario) => {
    setSelectedUsuario(usuario)
    setIsModalOpen(true)
  }

  const handleDelete = (usuario: Usuario) => {
    setUsuarioToDelete(usuario)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!usuarioToDelete) return

    try {
      await api.delete(`/usuarios/${usuarioToDelete.id}`)
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado exitosamente",
      })
      fetchUsuarios()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setUsuarioToDelete(null)
    }
  }

  const columns = [
    {
      header: "Nombre",
      accessor: "nombre" as keyof Usuario,
    },
    {
      header: "Correo",
      accessor: "correo" as keyof Usuario,
    },
    {
      header: "Rol",
      accessor: "rol" as keyof Usuario,
      cell: (value: string) => (
        <Badge variant={value === "ADMIN" ? "default" : "secondary"}>
          {value === "ADMIN" ? "Administrador" : "Empleado"}
        </Badge>
      ),
    },
    {
      header: "Acciones",
      accessor: ((row: Usuario) => (
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
          <h1 className="text-3xl font-bold tracking-tight text-balance">Usuarios</h1>
          <p className="text-muted-foreground mt-2">Gestión de usuarios y roles del sistema</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      <DataTable data={usuarios} columns={columns} searchPlaceholder="Buscar usuarios..." />

      <UsuarioModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        usuario={selectedUsuario}
        onSuccess={fetchUsuarios}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el usuario{" "}
              <strong>{usuarioToDelete?.nombre}</strong>.
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
