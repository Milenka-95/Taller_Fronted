"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"
import type { Vehiculo, Cliente } from "@/lib/types"
import { safeConsole } from "@/lib/utils"

const vehiculoSchema = yup.object({
  placa: yup.string().required("Placa es requerida"),
  marca: yup.string().required("Marca es requerida"),
  modelo: yup.string().required("Modelo es requerido"),
  año: yup
    .number()
    .required("Año es requerido")
    .min(1900)
    .max(new Date().getFullYear() + 1),
  clienteId: yup.number().required("Cliente es requerido"),
})

type VehiculoFormData = yup.InferType<typeof vehiculoSchema>

interface VehiculoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehiculo: Vehiculo | null
  onSuccess: () => void
}

export function VehiculoModal({ open, onOpenChange, vehiculo, onSuccess }: VehiculoModalProps) {
  const { toast } = useToast()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VehiculoFormData>({
    resolver: yupResolver(vehiculoSchema),
    defaultValues: {
      placa: "",
      marca: "",
      modelo: "",
      año: new Date().getFullYear(),
      clienteId: 0,
    },
  })

  const clienteId = watch("clienteId")

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await api.get("/clientes")
        setClientes(response.data)
      } catch (error) {
        safeConsole.error("[v0] Error fetching clientes:", error)
      }
    }
    fetchClientes()
  }, [])

  useEffect(() => {
    if (vehiculo) {
      setValue("placa", vehiculo.placa)
      setValue("marca", vehiculo.marca)
      setValue("modelo", vehiculo.modelo)
      setValue("año", vehiculo.año)
      setValue("clienteId", vehiculo.clienteId || 0)
    } else {
      reset()
    }
  }, [vehiculo, setValue, reset])

  const onSubmit = async (data: VehiculoFormData) => {
    try {
      if (vehiculo?.id) {
        await api.put(`/vehiculos/${vehiculo.id}`, data)
        toast({
          title: "Vehículo actualizado",
          description: "El vehículo ha sido actualizado exitosamente",
        })
      } else {
        await api.post("/vehiculos", data)
        toast({
          title: "Vehículo creado",
          description: "El vehículo ha sido creado exitosamente",
        })
      }
      onSuccess()
      onOpenChange(false)
      reset()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo guardar el vehículo",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{vehiculo ? "Editar Vehículo" : "Nuevo Vehículo"}</DialogTitle>
          <DialogDescription>
            {vehiculo ? "Actualiza la información del vehículo" : "Completa los datos del nuevo vehículo"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="placa">Placa</Label>
            <Input id="placa" {...register("placa")} />
            {errors.placa && <p className="text-sm text-destructive">{errors.placa.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="marca">Marca</Label>
            <Input id="marca" {...register("marca")} />
            {errors.marca && <p className="text-sm text-destructive">{errors.marca.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="modelo">Modelo</Label>
            <Input id="modelo" {...register("modelo")} />
            {errors.modelo && <p className="text-sm text-destructive">{errors.modelo.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="año">Año</Label>
            <Input id="año" type="number" {...register("año")} />
            {errors.año && <p className="text-sm text-destructive">{errors.año.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="clienteId">Cliente</Label>
            <Select
              value={clienteId?.toString()}
              onValueChange={(value) => setValue("clienteId", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id!.toString()}>
                    {cliente.razonSocial}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.clienteId && <p className="text-sm text-destructive">{errors.clienteId.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : vehiculo ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
