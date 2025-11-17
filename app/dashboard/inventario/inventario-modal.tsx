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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"
import type { Inventario, Proveedor } from "@/lib/types"

const inventarioSchema = yup.object({
  codigo: yup.string().required("Código es requerido"),
  nombre: yup.string().required("Nombre es requerido"),
  marca: yup.string().required("Marca es requerida"),
  cantidad: yup.number().required("Cantidad es requerida").min(1, "Cantidad debe ser mayor a 0"),
  precioUnitario: yup.number().required("Precio unitario es requerido").min(0, "Precio debe ser mayor o igual a 0"),
  tipoMovimiento: yup.string().oneOf(["ENTRADA", "SALIDA"]).required("Tipo de movimiento es requerido"),
  descripcionMovimiento: yup.string().required("Descripción es requerida"),
  proveedorId: yup.number().required("Proveedor es requerido"),
})

type InventarioFormData = yup.InferType<typeof inventarioSchema>

interface InventarioModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  inventario: Inventario | null
  onSuccess: () => void
}

export function InventarioModal({ open, onOpenChange, inventario, onSuccess }: InventarioModalProps) {
  const { toast } = useToast()
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InventarioFormData>({
    resolver: yupResolver(inventarioSchema),
    defaultValues: {
      codigo: "",
      nombre: "",
      marca: "",
      cantidad: 1,
      precioUnitario: 0,
      tipoMovimiento: "ENTRADA",
      descripcionMovimiento: "",
      proveedorId: 0,
    },
  })

  const proveedorId = watch("proveedorId")
  const tipoMovimiento = watch("tipoMovimiento")
  const cantidad = watch("cantidad")
  const precioUnitario = watch("precioUnitario")

  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        const response = await api.get("/proveedores")
        setProveedores(response.data)
      } catch (error) {
        console.error("[v0] Error fetching proveedores:", error)
      }
    }
    fetchProveedores()
  }, [])

  useEffect(() => {
    if (inventario) {
      setValue("codigo", inventario.codigo)
      setValue("nombre", inventario.nombre)
      setValue("marca", inventario.marca)
      setValue("cantidad", inventario.cantidad)
      setValue("precioUnitario", inventario.precioUnitario)
      setValue("tipoMovimiento", inventario.tipoMovimiento)
      setValue("descripcionMovimiento", inventario.descripcionMovimiento)
      setValue("proveedorId", inventario.proveedorId || 0)
    } else {
      reset()
    }
  }, [inventario, setValue, reset])

  const precioTotal = cantidad * precioUnitario

  const onSubmit = async (data: InventarioFormData) => {
    try {
      const payload = {
        ...data,
        precio: precioTotal,
      }

      if (inventario?.id) {
        await api.put(`/inventario/${inventario.id}`, payload)
        toast({
          title: "Movimiento actualizado",
          description: "El movimiento de inventario ha sido actualizado exitosamente",
        })
      } else {
        await api.post("/inventario", payload)
        toast({
          title: "Movimiento registrado",
          description: "El movimiento de inventario ha sido registrado exitosamente",
        })
      }
      onSuccess()
      onOpenChange(false)
      reset()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo guardar el movimiento",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{inventario ? "Editar Movimiento" : "Nuevo Movimiento de Inventario"}</DialogTitle>
          <DialogDescription>
            {inventario
              ? "Actualiza la información del movimiento"
              : "Registra un nuevo movimiento de entrada o salida"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código</Label>
              <Input id="codigo" {...register("codigo")} />
              {errors.codigo && <p className="text-sm text-destructive">{errors.codigo.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipoMovimiento">Tipo de Movimiento</Label>
              <Select
                value={tipoMovimiento}
                onValueChange={(value) => setValue("tipoMovimiento", value as "ENTRADA" | "SALIDA")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENTRADA">Entrada</SelectItem>
                  <SelectItem value="SALIDA">Salida</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipoMovimiento && <p className="text-sm text-destructive">{errors.tipoMovimiento.message}</p>}
            </div>
          </div>

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

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad</Label>
              <Input id="cantidad" type="number" {...register("cantidad")} />
              {errors.cantidad && <p className="text-sm text-destructive">{errors.cantidad.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="precioUnitario">Precio Unit. (S/)</Label>
              <Input id="precioUnitario" type="number" step="0.01" {...register("precioUnitario")} />
              {errors.precioUnitario && <p className="text-sm text-destructive">{errors.precioUnitario.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Precio Total</Label>
              <div className="flex h-10 items-center rounded-md border bg-muted px-3 text-sm font-semibold">
                S/ {precioTotal.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proveedorId">Proveedor</Label>
            <Select
              value={proveedorId?.toString()}
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
            <Label htmlFor="descripcionMovimiento">Descripción del Movimiento</Label>
            <Textarea id="descripcionMovimiento" {...register("descripcionMovimiento")} rows={3} />
            {errors.descripcionMovimiento && (
              <p className="text-sm text-destructive">{errors.descripcionMovimiento.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : inventario ? "Actualizar" : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
