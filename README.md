# MoDiesel - Sistema de Gestión de Taller

Sistema integral de gestión para talleres de maquinaria pesada construido con Next.js 15.

## 🔒 Seguridad

Este proyecto implementa las mejores prácticas de seguridad web:

- ✅ Content Security Policy (CSP) estricta
- ✅ Headers de seguridad HTTP (X-Frame-Options, HSTS, etc.)
- ✅ Cookies seguras con SameSite y Secure flags
- ✅ Sin logs en producción para prevenir fugas de datos
- ✅ Protección contra Clickjacking
- ✅ Protección contra XSS
- ✅ Protección contra MIME sniffing

Ver [SECURITY.md](./SECURITY.md) para documentación completa de seguridad.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18 o superior
- npm o pnpm

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Milenka-95/Taller_Fronted.git
cd Taller_Fronted

# Instalar dependencias
npm install --legacy-peer-deps

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tu configuración
```

### Variables de Entorno

```bash
NODE_ENV=development|production
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# La aplicación estará disponible en http://localhost:3000
```

### Producción

```bash
# Construir para producción
npm run build

# Iniciar servidor de producción
npm start
```

## 📦 Características

- **Gestión de Clientes** - Control completo de clientes
- **Gestión de Vehículos** - Administración de vehículos y maquinaria
- **Inventario** - Control de productos y repuestos
- **Ventas** - Sistema completo de ventas y facturación
- **Proveedores** - Gestión de proveedores
- **Dashboard** - Estadísticas y resumen del sistema
- **Autenticación** - Sistema seguro de login con JWT

## 🛠️ Tecnologías

- **Framework:** Next.js 15.2.4
- **UI:** React 19 + Tailwind CSS 4.1.9
- **Componentes:** Radix UI
- **Forms:** React Hook Form + Yup
- **HTTP Client:** Axios
- **State Management:** Zustand
- **Cookies:** js-cookie
- **Iconos:** Lucide React

## 📁 Estructura del Proyecto

```
Taller_Fronted/
├── app/                      # Rutas de Next.js App Router
│   ├── dashboard/           # Páginas del dashboard
│   ├── login/               # Página de login
│   ├── layout.tsx           # Layout principal
│   └── page.tsx             # Página de inicio
├── components/              # Componentes UI reutilizables
├── lib/                     # Utilidades y configuración
│   ├── api.ts              # Cliente Axios configurado
│   ├── store.ts            # Store de Zustand
│   ├── types.ts            # Tipos TypeScript
│   └── utils.ts            # Funciones utilitarias
├── public/                  # Archivos estáticos
├── middleware.ts            # Middleware de autenticación
├── next.config.mjs          # Configuración de Next.js (con headers de seguridad)
├── SECURITY.md              # Documentación de seguridad
└── package.json
```

## 🔐 Autenticación

El sistema utiliza JWT (JSON Web Tokens) para autenticación:

1. Login con correo y contraseña
2. Token JWT almacenado en cookies seguras
3. Middleware protege rutas del dashboard
4. Token incluido automáticamente en peticiones API
5. Auto-logout en caso de token inválido o expirado

## 🌐 API Backend

El frontend se conecta a un backend REST API. Configurar la URL en la variable de entorno `NEXT_PUBLIC_API_URL`.

Endpoints principales:
- `POST /auth/login` - Autenticación
- `GET /clientes` - Listar clientes
- `GET /vehiculos` - Listar vehículos
- `GET /productos` - Listar productos
- `GET /ventas` - Listar ventas
- Y más...

## 🧪 Testing

```bash
# Ejecutar linter
npm run lint

# Build de producción (validación)
npm run build
```

## 📝 Licencia

Este proyecto es privado y propiedad de MoDiesel.

## 👥 Contribución

Este es un proyecto privado. Para contribuir, contacta al equipo de desarrollo.

## 📞 Soporte

Para soporte técnico o reportar problemas, contacta al equipo de desarrollo.

---

**Última actualización:** 2025-11-17
**Versión:** 0.1.0
