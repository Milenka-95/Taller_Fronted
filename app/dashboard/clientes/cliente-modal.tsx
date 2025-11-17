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
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"
import type { Cliente } from "@/lib/types"

const clienteSchema = yup.object({
  ruc: yup.string().required("RUC es requerido").min(11, "RUC debe tener 11 dígitos"),
  razonSocial: yup.string().required("Razón social es requerida"),
  correo: yup.string().email("Correo inválido").required("Correo es requerido"),
  telefono: yup.string().required("Teléfono es requerido"),
  estado: yup.boolean().required(),
})

type ClienteFormData = yup.InferType<typeof clienteSchema>

interface ClienteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cliente: Cliente | null
  onSuccess: () => void
}

export function ClienteModal({ open, onOpenChange, cliente, onSuccess }: ClienteModalProps) {
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ClienteFormData>({
    resolver: yupResolver(clienteSchema),
    defaultValues: {
      ruc: "",
      razonSocial: "",
      correo: "",
      telefono: "",
      estado: true,
    },
  })

  const estado = watch("estado")

  useEffect(() => {
    if (cliente) {
      setValue("ruc", cliente.ruc)
      setValue("razonSocial", cliente.razonSocial)
      setValue("correo", cliente.correo)
      setValue("telefono", cliente.telefono)
      setValue("estado", cliente.estado)
    } else {
      reset()
    }
  }, [cliente, setValue, reset])

  const onSubmit = async (data: ClienteFormData) => {
    try {
      if (cliente?.id) {
        await api.put(`/clientes/${cliente.id}`, data)
        toast({
          title: "Cliente actualizado",
          description: "El cliente ha sido actualizado exitosamente",
        })
      } else {
        await api.post("/clientes", data)
        toast({
          title: "Cliente creado",
          description: "El cliente ha sido creado exitosamente",
        })
      }
      onSuccess()
      onOpenChange(false)
      reset()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo guardar el cliente",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{cliente ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
          <DialogDescription>
            {cliente ? "Actualiza la información del cliente" : "Completa los datos del nuevo cliente"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ruc">RUC</Label>
            <Input id="ruc" {...register("ruc")} />
            {errors.ruc && <p className="text-sm text-destructive">{errors.ruc.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="razonSocial">Razón Social</Label>
            <Input id="razonSocial" {...register("razonSocial")} />
            {errors.razonSocial && <p className="text-sm text-destructive">{errors.razonSocial.message}</p>}
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

          <div className="flex items-center justify-between">
            <Label htmlFor="estado">Estado Activo</Label>
            <Switch id="estado" checked={estado} onCheckedChange={(checked) => setValue("estado", checked)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : cliente ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
