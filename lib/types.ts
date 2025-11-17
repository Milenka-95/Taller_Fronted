export interface Usuario {
  id?: number
  nombre: string
  correo: string
  password?: string
  rol: "ADMIN" | "EMPLEADO"
}

export interface Cliente {
  id?: number
  ruc: string
  razonSocial: string
  estado: boolean
  correo: string
  telefono: string
  vehiculos?: Vehiculo[]
}

export interface Vehiculo {
  id?: number
  placa: string
  marca: string
  modelo: string
  año: number
  cliente?: Cliente
  clienteId?: number
}

export interface Proveedor {
  id?: number
  ruc: string
  nombre: string
  correo: string
  telefono: string
  direccion: string
}

export interface Producto {
  id?: number
  nombre: string
  marca: string
  descripcion: string
  precio: number
  stock: number
  proveedor?: Proveedor
  proveedorId?: number
}

export interface Repuesto {
  id?: number
  nombre: string
  marca: string
  precio: number
  stock: number
  proveedor?: Proveedor
  proveedorId?: number
  vehiculo?: Vehiculo
  vehiculoId?: number
}

export interface Inventario {
  id?: number
  codigo: string
  nombre: string
  marca: string
  cantidad: number
  precio: number
  precioUnitario: number
  tipoMovimiento: "ENTRADA" | "SALIDA"
  descripcionMovimiento: string
  proveedor?: Proveedor
  proveedorId?: number
}

export interface DetalleVenta {
  id?: number
  producto?: Producto
  productoId?: number
  cantidad: number
  subtotal: number
}

export interface Factura {
  id?: number
  numero: string
  fechaEmision: string
  total: number
}

export interface Venta {
  id?: number
  fecha: string
  total: number
  cliente?: Cliente
  clienteId?: number
  empleado?: Usuario
  empleadoId?: number
  detalles: DetalleVenta[]
  factura?: Factura
}

export interface Imagen {
  id?: number
  nombre: string
  url: string
  tipo: string
  fechaSubida: string
  usuario?: Usuario
  usuarioId?: number
}
