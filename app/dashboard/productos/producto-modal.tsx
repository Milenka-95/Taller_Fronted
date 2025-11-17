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
import type { Producto, Proveedor } from "@/lib/types"
import { safeConsole } from "@/lib/utils"

const productoSchema = yup.object({
  nombre: yup.string().required("Nombre es requerido"),
  marca: yup.string().required("Marca es requerida"),
  descripcion: yup.string().required("Descripción es requerida"),
  precio: yup.number().required("Precio es requerido").min(0, "Precio debe ser mayor a 0"),
  stock: yup.number().required("Stock es requerido").min(0, "Stock debe ser mayor o igual a 0"),
  proveedorId: yup.number().required("Proveedor es requerido"),
})

type ProductoFormData = yup.InferType<typeof productoSchema>

interface ProductoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  producto: Producto | null
  onSuccess: () => void
}

export function ProductoModal({ open, onOpenChange, producto, onSuccess }: ProductoModalProps) {
  const { toast } = useToast()
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductoFormData>({
    resolver: yupResolver(productoSchema),
    defaultValues: {
      nombre: "",
      marca: "",
      descripcion: "",
      precio: 0,
      stock: 0,
      proveedorId: 0,
    },
  })

  const proveedorId = watch("proveedorId")

  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        const response = await api.get("/proveedores")
        setProveedores(response.data)
      } catch (error) {
        safeConsole.error("[v0] Error fetching proveedores:", error)
      }
    }
    fetchProveedores()
  }, [])

  useEffect(() => {
    if (producto) {
      setValue("nombre", producto.nombre)
      setValue("marca", producto.marca)
      setValue("descripcion", producto.descripcion)
      setValue("precio", producto.precio)
      setValue("stock", producto.stock)
      setValue("proveedorId", producto.proveedorId || 0)
    } else {
      reset()
    }
  }, [producto, setValue, reset])

  const onSubmit = async (data: ProductoFormData) => {
    try {
      if (producto?.id) {
        await api.put(`/productos/${producto.id}`, data)
        toast({
          title: "Producto actualizado",
          description: "El producto ha sido actualizado exitosamente",
        })
      } else {
        await api.post("/productos", data)
        toast({
          title: "Producto creado",
          description: "El producto ha sido creado exitosamente",
        })
      }
      onSuccess()
      onOpenChange(false)
      reset()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo guardar el producto",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{producto ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
          <DialogDescription>
            {producto ? "Actualiza la información del producto" : "Completa los datos del nuevo producto"}
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

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea id="descripcion" {...register("descripcion")} rows={3} />
            {errors.descripcion && <p className="text-sm text-destructive">{errors.descripcion.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precio">Precio (S/)</Label>
              <Input id="precio" type="number" step="0.01" {...register("precio")} />
              {errors.precio && <p className="text-sm text-destructive">{errors.precio.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" type="number" {...register("stock")} />
              {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : producto ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
