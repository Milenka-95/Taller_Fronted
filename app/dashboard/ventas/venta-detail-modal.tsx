"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Venta } from "@/lib/types"
import { FileText, User, Calendar, Package } from "lucide-react"

interface VentaDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  venta: Venta | null
}

export function VentaDetailModal({ open, onOpenChange, venta }: VentaDetailModalProps) {
  if (!venta) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalle de Venta</DialogTitle>
          <DialogDescription>Información completa de la venta y factura</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Fecha:</span>
                <span className="font-medium">{new Date(venta.fecha).toLocaleDateString("es-PE")}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Cliente:</span>
                <span className="font-medium">{venta.cliente?.razonSocial}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Empleado:</span>
                <span className="font-medium">{venta.empleado?.nombre}</span>
              </div>
            </CardContent>
          </Card>

          {venta.factura && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Factura
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Número:</span>
                  <Badge variant="default">{venta.factura.numero}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Fecha Emisión:</span>
                  <span className="font-medium">
                    {new Date(venta.factura.fechaEmision).toLocaleDateString("es-PE")}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                Productos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {venta.detalles?.map((detalle, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{detalle.producto?.nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        {detalle.cantidad} x S/ {(detalle.subtotal / detalle.cantidad).toFixed(2)}
                      </p>
                    </div>
                    <span className="font-semibold">S/ {detalle.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-2xl font-bold text-accent">S/ {venta.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
