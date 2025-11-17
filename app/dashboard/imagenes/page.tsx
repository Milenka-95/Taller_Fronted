"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/lib/store"
import api from "@/lib/api"
import { safeConsole } from "@/lib/utils"
import type { Imagen } from "@/lib/types"
import { ImagenModal } from "./imagen-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ImagenesPage() {
  const [imagenes, setImagenes] = useState<Imagen[]>([])
  const [filteredImagenes, setFilteredImagenes] = useState<Imagen[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [imagenToDelete, setImagenToDelete] = useState<Imagen | null>(null)
  const [tipoFilter, setTipoFilter] = useState<string>("all")
  const { toast } = useToast()
  const user = useAuthStore((state) => state.user)

  const fetchImagenes = async () => {
    try {
      const response = await api.get("/imagenes")
      setImagenes(response.data)
      setFilteredImagenes(response.data)
    } catch (error) {
      safeConsole.error("[v0] Error fetching imagenes:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las imágenes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchImagenes()
  }, [])

  useEffect(() => {
    if (tipoFilter === "all") {
      setFilteredImagenes(imagenes)
    } else {
      setFilteredImagenes(imagenes.filter((img) => img.tipo === tipoFilter))
    }
  }, [tipoFilter, imagenes])

  const handleCreate = () => {
    setIsModalOpen(true)
  }

  const handleDelete = (imagen: Imagen) => {
    setImagenToDelete(imagen)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!imagenToDelete) return

    try {
      await api.delete(`/imagenes/${imagenToDelete.id}`)
      toast({
        title: "Imagen eliminada",
        description: "La imagen ha sido eliminada exitosamente",
      })
      fetchImagenes()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la imagen",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setImagenToDelete(null)
    }
  }

  const tipos = Array.from(new Set(imagenes.map((img) => img.tipo)))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">Galería de Imágenes</h1>
          <p className="text-muted-foreground mt-2">Gestión de imágenes del taller</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Subir Imagen
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {tipos.map((tipo) => (
              <SelectItem key={tipo} value={tipo}>
                {tipo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="outline">
          {filteredImagenes.length} {filteredImagenes.length === 1 ? "imagen" : "imágenes"}
        </Badge>
      </div>

      {filteredImagenes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No hay imágenes disponibles</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredImagenes.map((imagen) => (
            <Card key={imagen.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square relative bg-muted">
                <img
                  src={imagen.url || "/placeholder.svg"}
                  alt={imagen.nombre}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4 space-y-2">
                <div>
                  <h3 className="font-semibold line-clamp-1">{imagen.nombre}</h3>
                  <p className="text-xs text-muted-foreground">
                    {new Date(imagen.fechaSubida).toLocaleDateString("es-PE")}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{imagen.tipo}</Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <a href={imagen.url} download target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(imagen)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ImagenModal open={isModalOpen} onOpenChange={setIsModalOpen} onSuccess={fetchImagenes} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la imagen{" "}
              <strong>{imagenToDelete?.nombre}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
