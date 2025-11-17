"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"
import { safeConsole } from "@/lib/utils"
import type { Vehiculo } from "@/lib/types"
import { VehiculoModal } from "./vehiculo-modal"
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

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedVehiculo, setSelectedVehiculo] = useState<Vehiculo | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [vehiculoToDelete, setVehiculoToDelete] = useState<Vehiculo | null>(null)
  const { toast } = useToast()

  const fetchVehiculos = async () => {
    try {
      const response = await api.get("/vehiculos")
      setVehiculos(response.data)
    } catch (error) {
      safeConsole.error("[v0] Error fetching vehiculos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los vehículos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVehiculos()
  }, [])

  const handleCreate = () => {
    setSelectedVehiculo(null)
    setIsModalOpen(true)
  }

  const handleEdit = (vehiculo: Vehiculo) => {
    setSelectedVehiculo(vehiculo)
    setIsModalOpen(true)
  }

  const handleDelete = (vehiculo: Vehiculo) => {
    setVehiculoToDelete(vehiculo)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!vehiculoToDelete) return

    try {
      await api.delete(`/vehiculos/${vehiculoToDelete.id}`)
      toast({
        title: "Vehículo eliminado",
        description: "El vehículo ha sido eliminado exitosamente",
      })
      fetchVehiculos()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el vehículo",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setVehiculoToDelete(null)
    }
  }

  const columns = [
    {
      header: "Placa",
      accessor: "placa" as keyof Vehiculo,
    },
    {
      header: "Marca",
      accessor: "marca" as keyof Vehiculo,
    },
    {
      header: "Modelo",
      accessor: "modelo" as keyof Vehiculo,
    },
    {
      header: "Año",
      accessor: "año" as keyof Vehiculo,
    },
    {
      header: "Cliente",
      accessor: ((row: Vehiculo) => row.cliente?.razonSocial || "N/A") as any,
    },
    {
      header: "Acciones",
      accessor: ((row: Vehiculo) => (
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
          <h1 className="text-3xl font-bold tracking-tight text-balance">Vehículos</h1>
          <p className="text-muted-foreground mt-2">Gestión de vehículos y maquinaria pesada</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Vehículo
        </Button>
      </div>

      <DataTable data={vehiculos} columns={columns} searchPlaceholder="Buscar vehículos..." />

      <VehiculoModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        vehiculo={selectedVehiculo}
        onSuccess={fetchVehiculos}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el vehículo con placa{" "}
              <strong>{vehiculoToDelete?.placa}</strong>.
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
