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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"
import type { Usuario } from "@/lib/types"

const getUsuarioSchema = (isEdit: boolean) =>
  yup.object({
    nombre: yup.string().required("Nombre es requerido"),
    correo: yup.string().email("Correo inválido").required("Correo es requerido"),
    password: isEdit
      ? yup.string().optional().min(6, "Mínimo 6 caracteres")
      : yup.string().required("Contraseña es requerida").min(6, "Mínimo 6 caracteres"),
    rol: yup.string().oneOf(["ADMIN", "EMPLEADO"] as const).required("Rol es requerido"),
  })

type UsuarioFormData = {
  nombre: string
  correo: string
  password?: string
  rol: "ADMIN" | "EMPLEADO"
}

interface UsuarioModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  usuario: Usuario | null
  onSuccess: () => void
}

export function UsuarioModal({ open, onOpenChange, usuario, onSuccess }: UsuarioModalProps) {
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UsuarioFormData>({
    resolver: yupResolver(getUsuarioSchema(!!usuario)) as any,
    defaultValues: {
      nombre: "",
      correo: "",
      password: "",
      rol: "EMPLEADO",
    },
  })

  const rol = watch("rol")

  useEffect(() => {
    if (usuario) {
      setValue("nombre", usuario.nombre)
      setValue("correo", usuario.correo)
      setValue("rol", usuario.rol)
      setValue("password", "")
    } else {
      reset()
    }
  }, [usuario, setValue, reset])

  const onSubmit = async (data: UsuarioFormData) => {
    try {
      const payload = usuario ? { ...data, password: data.password || undefined } : data

      if (usuario?.id) {
        await api.put(`/usuarios/${usuario.id}`, payload)
        toast({
          title: "Usuario actualizado",
          description: "El usuario ha sido actualizado exitosamente",
        })
      } else {
        await api.post("/usuarios", payload)
        toast({
          title: "Usuario creado",
          description: "El usuario ha sido creado exitosamente",
        })
      }
      onSuccess()
      onOpenChange(false)
      reset()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo guardar el usuario",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{usuario ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
          <DialogDescription>
            {usuario ? "Actualiza la información del usuario" : "Completa los datos del nuevo usuario"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre Completo</Label>
            <Input id="nombre" {...register("nombre")} />
            {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="correo">Correo Electrónico</Label>
            <Input id="correo" type="email" {...register("correo")} />
            {errors.correo && <p className="text-sm text-destructive">{errors.correo.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña {usuario && "(dejar vacío para no cambiar)"}</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rol">Rol</Label>
            <Select value={rol} onValueChange={(value) => setValue("rol", value as "ADMIN" | "EMPLEADO")}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Administrador</SelectItem>
                <SelectItem value="EMPLEADO">Empleado</SelectItem>
              </SelectContent>
            </Select>
            {errors.rol && <p className="text-sm text-destructive">{errors.rol.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : usuario ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}