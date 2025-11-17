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
import type { Repuesto, Proveedor, Vehiculo } from "@/lib/types"

const repuestoSchema = yup.object({
  nombre: yup.string().required("Nombre es requerido"),
  marca: yup.string().required("Marca es requerida"),
  precio: yup.number().required("Precio es requerido").min(0, "Precio debe ser mayor a 0"),
  stock: yup.number().required("Stock es requerido").min(0, "Stock debe ser mayor o igual a 0"),
  proveedorId: yup.number().required("Proveedor es requerido"),
  vehiculoId: yup.number().nullable(),
})

type RepuestoFormData = {
  nombre: string
  marca: string
  precio: number
  stock: number
  proveedorId: number
  vehiculoId: number | null
}

interface RepuestoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  repuesto: Repuesto | null
  onSuccess: () => void
}

export function RepuestoModal({ open, onOpenChange, repuesto, onSuccess }: RepuestoModalProps) {
  const { toast } = useToast()
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RepuestoFormData>({
    resolver: yupResolver(repuestoSchema) as any,
    defaultValues: {
      nombre: "",
      marca: "",
      precio: 0,
      stock: 0,
      proveedorId: 0,
      vehiculoId: null,
    },
  })

  const proveedorId = watch("proveedorId")
  const vehiculoId = watch("vehiculoId")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [proveedoresRes, vehiculosRes] = await Promise.all([api.get("/proveedores"), api.get("/vehiculos")])
        setProveedores(proveedoresRes.data)
        setVehiculos(vehiculosRes.data)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (repuesto) {
      setValue("nombre", repuesto.nombre)
      setValue("marca", repuesto.marca)
      setValue("precio", repuesto.precio)
      setValue("stock", repuesto.stock)
      setValue("proveedorId", repuesto.proveedorId || 0)
      setValue("vehiculoId", repuesto.vehiculoId || null)
    } else {
      reset()
    }
  }, [repuesto, setValue, reset])

  const onSubmit = async (data: RepuestoFormData) => {
    try {
      if (repuesto?.id) {
        await api.put(`/repuestos/${repuesto.id}`, data)
        toast({
          title: "Repuesto actualizado",
          description: "El repuesto ha sido actualizado exitosamente",
        })
      } else {
        await api.post("/repuestos", data)
        toast({
          title: "Repuesto creado",
          description: "El repuesto ha sido creado exitosamente",
        })
      }
      onSuccess()
      onOpenChange(false)
      reset()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo guardar el repuesto",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{repuesto ? "Editar Repuesto" : "Nuevo Repuesto"}</DialogTitle>
          <DialogDescription>
            {repuesto ? "Actualiza la información del repuesto" : "Completa los datos del nuevo repuesto"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" {...register("nombre")} />
            {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="marca">Marca</Label>
            <Input id="marca" {...register("marca")} />
            {errors.marca && <p className="text-sm text-destructive">{errors.marca.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precio">Precio (S/)</Label>
              <Input id="precio" type="number" step="0.01" {...register("precio", { valueAsNumber: true })} />
              {errors.precio && <p className="text-sm text-destructive">{errors.precio.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" type="number" {...register("stock", { valueAsNumber: true })} />
              {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proveedorId">Proveedor</Label>
            <Select
              value={proveedorId?.toString() || ""}
              onValueChange={(value) => setValue("proveedorId", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar proveedor" />
              </SelectTrigger>
              <SelectContent>
                {proveedores.map((proveedor) => (
                  <SelectItem key={proveedor.id} value={proveedor.id!.toString()}>
                    {proveedor.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.proveedorId && <p className="text-sm text-destructive">{errors.proveedorId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehiculoId">Vehículo (Opcional)</Label>
            <Select
              value={vehiculoId?.toString() || "none"}
              onValueChange={(value) => setValue("vehiculoId", value === "none" ? null : Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar vehículo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin vehículo específico</SelectItem>
                {vehiculos.map((vehiculo) => (
                  <SelectItem key={vehiculo.id} value={vehiculo.id!.toString()}>
                    {vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : repuesto ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}