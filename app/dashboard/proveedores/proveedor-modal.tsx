"use client"

import { useEffect } from "react"
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
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"
import type { Proveedor } from "@/lib/types"

const proveedorSchema = yup.object({
  ruc: yup.string().required("RUC es requerido").min(11, "RUC debe tener 11 dígitos"),
  nombre: yup.string().required("Nombre es requerido"),
  correo: yup.string().email("Correo inválido").required("Correo es requerido"),
  telefono: yup.string().required("Teléfono es requerido"),
  direccion: yup.string().required("Dirección es requerida"),
})

type ProveedorFormData = yup.InferType<typeof proveedorSchema>

interface ProveedorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  proveedor: Proveedor | null
  onSuccess: () => void
}

export function ProveedorModal({ open, onOpenChange, proveedor, onSuccess }: ProveedorModalProps) {
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProveedorFormData>({
    resolver: yupResolver(proveedorSchema),
    defaultValues: {
      ruc: "",
      nombre: "",
      correo: "",
      telefono: "",
      direccion: "",
    },
  })

  useEffect(() => {
    if (proveedor) {
      setValue("ruc", proveedor.ruc)
      setValue("nombre", proveedor.nombre)
      setValue("correo", proveedor.correo)
      setValue("telefono", proveedor.telefono)
      setValue("direccion", proveedor.direccion)
    } else {
      reset()
    }
  }, [proveedor, setValue, reset])

  const onSubmit = async (data: ProveedorFormData) => {
    try {
      if (proveedor?.id) {
        await api.put(`/proveedores/${proveedor.id}`, data)
        toast({
          title: "Proveedor actualizado",
          description: "El proveedor ha sido actualizado exitosamente",
        })
      } else {
        await api.post("/proveedores", data)
        toast({
          title: "Proveedor creado",
          description: "El proveedor ha sido creado exitosamente",
        })
      }
      onSuccess()
      onOpenChange(false)
      reset()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo guardar el proveedor",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{proveedor ? "Editar Proveedor" : "Nuevo Proveedor"}</DialogTitle>
          <DialogDescription>
            {proveedor ? "Actualiza la información del proveedor" : "Completa los datos del nuevo proveedor"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ruc">RUC</Label>
            <Input id="ruc" {...register("ruc")} />
            {errors.ruc && <p className="text-sm text-destructive">{errors.ruc.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" {...register("nombre")} />
            {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="correo">Correo Electrónico</Label>
            <Input id="correo" type="email" {...register("correo")} />
            {errors.correo && <p className="text-sm text-destructive">{errors.correo.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input id="telefono" {...register("telefono")} />
            {errors.telefono && <p className="text-sm text-destructive">{errors.telefono.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Textarea id="direccion" {...register("direccion")} rows={3} />
            {errors.direccion && <p className="text-sm text-destructive">{errors.direccion.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : proveedor ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
