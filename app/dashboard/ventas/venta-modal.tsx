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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/lib/store"
import api from "@/lib/api"
import type { Cliente, Producto, DetalleVenta } from "@/lib/types"
import { Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { safeConsole } from "@/lib/utils"

const ventaSchema = yup.object({
  clienteId: yup.number().required("Cliente es requerido"),
})

type VentaFormData = yup.InferType<typeof ventaSchema>

interface VentaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function VentaModal({ open, onOpenChange, onSuccess }: VentaModalProps) {
  const { toast } = useToast()
  const user = useAuthStore((state) => state.user)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [detalles, setDetalles] = useState<DetalleVenta[]>([])
  const [selectedProductoId, setSelectedProductoId] = useState<number>(0)
  const [cantidad, setCantidad] = useState<number>(1)

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VentaFormData>({
    resolver: yupResolver(ventaSchema),
    defaultValues: {
      clienteId: 0,
    },
  })

  const clienteId = watch("clienteId")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientesRes, productosRes] = await Promise.all([api.get("/clientes"), api.get("/productos")])
        setClientes(clientesRes.data)
        setProductos(productosRes.data)
      } catch (error) {
        safeConsole.error("[v0] Error fetching data:", error)
      }
    }
    fetchData()
  }, [])

  const handleAddProducto = () => {
    if (!selectedProductoId || cantidad <= 0) {
      toast({
        title: "Error",
        description: "Selecciona un producto y cantidad válida",
        variant: "destructive",
      })
      return
    }

    const producto = productos.find((p) => p.id === selectedProductoId)
    if (!producto) return

    if (cantidad > producto.stock) {
      toast({
        title: "Stock insuficiente",
        description: `Solo hay ${producto.stock} unidades disponibles`,
        variant: "destructive",
      })
      return
    }

    const existingIndex = detalles.findIndex((d) => d.productoId === selectedProductoId)

    if (existingIndex >= 0) {
      const newDetalles = [...detalles]
      newDetalles[existingIndex].cantidad += cantidad
      newDetalles[existingIndex].subtotal = newDetalles[existingIndex].cantidad * producto.precio
      setDetalles(newDetalles)
    } else {
      setDetalles([
        ...detalles,
        {
          productoId: selectedProductoId,
          producto,
          cantidad,
          subtotal: cantidad * producto.precio,
        },
      ])
    }

    setSelectedProductoId(0)
    setCantidad(1)
  }

  const handleRemoveProducto = (index: number) => {
    setDetalles(detalles.filter((_, i) => i !== index))
  }

  const total = detalles.reduce((sum, detalle) => sum + detalle.subtotal, 0)

  const onSubmit = async (data: VentaFormData) => {
    if (detalles.length === 0) {
      toast({
        title: "Error",
        description: "Agrega al menos un producto a la venta",
        variant: "destructive",
      })
      return
    }

    try {
      const ventaData = {
        clienteId: data.clienteId,
        empleadoId: user?.id,
        fecha: new Date().toISOString(),
        total,
        detalles: detalles.map((d) => ({
          productoId: d.productoId,
          cantidad: d.cantidad,
          subtotal: d.subtotal,
        })),
      }

      await api.post("/ventas", ventaData)
      toast({
        title: "Venta registrada",
        description: "La venta ha sido registrada exitosamente",
      })
      onSuccess()
      onOpenChange(false)
      setDetalles([])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo registrar la venta",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Venta</DialogTitle>
          <DialogDescription>Registra una nueva venta y genera la factura automáticamente</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <div className="space-y-3">
            <Label>Agregar Productos</Label>
            <div className="flex gap-2">
              <Select
                value={selectedProductoId?.toString()}
                onValueChange={(value) => setSelectedProductoId(Number.parseInt(value))}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Seleccionar producto" />
                </SelectTrigger>
                <SelectContent>
                  {productos.map((producto) => (
                    <SelectItem key={producto.id} value={producto.id!.toString()}>
                      {producto.nombre} - S/ {producto.precio.toFixed(2)} (Stock: {producto.stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(Number.parseInt(e.target.value) || 1)}
                className="w-24"
                placeholder="Cant."
              />
              <Button type="button" onClick={handleAddProducto}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {detalles.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Productos Seleccionados</Label>
                  {detalles.map((detalle, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{detalle.producto?.nombre}</p>
                        <p className="text-sm text-muted-foreground">
                          {detalle.cantidad} x S/ {detalle.producto?.precio.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">S/ {detalle.subtotal.toFixed(2)}</span>
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveProducto(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="text-lg font-bold">Total:</span>
                    <span className="text-2xl font-bold text-accent">S/ {total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || detalles.length === 0}>
              {isSubmitting ? "Procesando..." : "Registrar Venta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
