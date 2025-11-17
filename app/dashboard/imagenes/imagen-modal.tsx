"use client"

import type React from "react"

import { useState } from "react"
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
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/lib/store"
import api from "@/lib/api"
import { Upload } from "lucide-react"

const imagenSchema = yup.object({
  nombre: yup.string().required("Nombre es requerido"),
  tipo: yup.string().required("Tipo es requerido"),
})

type ImagenFormData = yup.InferType<typeof imagenSchema>

interface ImagenModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ImagenModal({ open, onOpenChange, onSuccess }: ImagenModalProps) {
  const { toast } = useToast()
  const user = useAuthStore((state) => state.user)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ImagenFormData>({
    resolver: yupResolver(imagenSchema),
    defaultValues: {
      nombre: "",
      tipo: "",
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const onSubmit = async (data: ImagenFormData) => {
    if (!file) {
      toast({
        title: "Error",
        description: "Selecciona una imagen para subir",
        variant: "destructive",
      })
      return
    }

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("nombre", data.nombre)
      formData.append("tipo", data.tipo)
      formData.append("usuarioId", user?.id?.toString() || "")

      await api.post("/imagenes", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      toast({
        title: "Imagen subida",
        description: "La imagen ha sido subida exitosamente",
      })
      onSuccess()
      onOpenChange(false)
      reset()
      setFile(null)
      setPreview(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo subir la imagen",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Subir Imagen</DialogTitle>
          <DialogDescription>Sube una nueva imagen a la galería del taller</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Archivo de Imagen</Label>
            <div className="flex items-center gap-2">
              <Input id="file" type="file" accept="image/*" onChange={handleFileChange} />
            </div>
            {preview && (
              <div className="mt-2 rounded-lg overflow-hidden border">
                <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-48 object-cover" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" {...register("nombre")} placeholder="Ej: Reparación de motor" />
            {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <Input id="tipo" {...register("tipo")} placeholder="Ej: Reparación, Mantenimiento, Repuesto" />
            {errors.tipo && <p className="text-sm text-destructive">{errors.tipo.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !file}>
              <Upload className="mr-2 h-4 w-4" />
              {isSubmitting ? "Subiendo..." : "Subir Imagen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
