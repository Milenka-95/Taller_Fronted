# Security Improvements

Este documento describe las mejoras de seguridad implementadas en el proyecto MoDiesel basadas en el escaneo de vulnerabilidades realizado con ZAP (Zed Attack Proxy).

## Vulnerabilidades Corregidas

### 1. Content Security Policy (CSP)

**Problema:** No había CSP configurado, permitiendo potencialmente ataques XSS.

**Solución:** Implementamos una CSP estricta en `next.config.mjs` con las siguientes directivas:

```javascript
Content-Security-Policy:
  - default-src 'self'
  - script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com
  - style-src 'self' 'unsafe-inline'
  - img-src 'self' data: https:
  - font-src 'self' data:
  - connect-src 'self' http://localhost:8080 https:
  - frame-ancestors 'none'
  - base-uri 'self'
  - form-action 'self'
  - object-src 'none'
```

**Nota:** Los valores `unsafe-inline` y `unsafe-eval` en `script-src` son temporales debido a Next.js y Vercel Analytics. En el futuro, se deben reemplazar con nonces o hashes cuando sea posible.

### 2. Cabeceras de Seguridad HTTP

Se implementaron las siguientes cabeceras de seguridad:

#### X-Frame-Options: DENY
Previene ataques de clickjacking al no permitir que la aplicación sea embebida en iframes.

#### X-Content-Type-Options: nosniff
Previene ataques de tipo MIME sniffing.

#### Referrer-Policy: strict-origin-when-cross-origin
Controla qué información de referrer se envía en las solicitudes.

#### Strict-Transport-Security (HSTS)
Fuerza el uso de HTTPS con la siguiente configuración:
- `max-age=31536000` (1 año)
- `includeSubDomains`
- `preload`

#### Permissions-Policy
Desactiva características del navegador no necesarias:
- `camera=()`
- `microphone=()`
- `geolocation=()`
- `interest-cohort=()`

### 3. Seguridad en Formularios

**Problema:** Riesgo de envío de credenciales en URL.

**Verificación:** El formulario de login ya utiliza el método POST y envía las credenciales en el body de la solicitud, nunca en la URL.

**Mejoras adicionales:**
- Las cookies de autenticación usan `SameSite: strict`
- Flag `secure: true` en producción para cookies
- Los atributos `autocomplete` apropiados están configurados

### 4. Manejo de Logs y Errores

**Problema:** Los logs de consola pueden exponer información sensible en producción.

**Solución:** 
- Creamos una utilidad `safeConsole` en `lib/utils.ts` que solo registra mensajes en modo desarrollo
- Actualizamos todos los archivos para usar `safeConsole` en lugar de `console` directamente
- Los errores no muestran stack traces completos al usuario, solo mensajes genéricos

Archivos actualizados:
- `app/login/page.tsx`
- `app/dashboard/page.tsx`
- Todos los archivos en `app/dashboard/**/page.tsx`
- Todos los modales en `app/dashboard/**/*-modal.tsx`

### 5. Configuración de Cookies

Las cookies de autenticación están configuradas con:
- `expires: 7` días
- `path: /`
- `sameSite: strict` (en lugar de `lax`)
- `secure: process.env.NODE_ENV === 'production'`

### 6. API Error Handling

El interceptor de API (`lib/api.ts`) maneja errores 401 automáticamente:
- Limpia tokens y datos de usuario
- Redirige al login
- No expone detalles del error al usuario

## Configuración para Producción

### Variables de Entorno

Asegúrate de configurar las siguientes variables de entorno en producción:

```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://tu-api-backend.com/api
```

### Servidor de Producción

Si despliegas con un servidor personalizado (Nginx, Apache), agrega las siguientes cabeceras adicionales:

#### Nginx
```nginx
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

#### Apache
```apache
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "DENY"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
```

## Próximos Pasos de Seguridad

1. **CSP Mejorada:** Eliminar `unsafe-inline` y `unsafe-eval` usando nonces o hashes
2. **SRI (Subresource Integrity):** Agregar hashes de integridad para scripts externos
3. **Rate Limiting:** Implementar límites de tasa en el backend para prevenir ataques de fuerza bruta
4. **2FA:** Considerar implementar autenticación de dos factores
5. **Auditorías Regulares:** Realizar escaneos de seguridad periódicos

## Testing de Seguridad

Para verificar las cabeceras de seguridad:

```bash
# Con curl
curl -I https://tu-dominio.com

# Con securityheaders.com
# Visita: https://securityheaders.com/?q=tu-dominio.com

# Con ZAP
# Ejecuta un escaneo completo con OWASP ZAP
```

## Contacto de Seguridad

Si descubres una vulnerabilidad de seguridad, por favor repórtala de forma responsable contactando al equipo de desarrollo.

---

**Última actualización:** 2025-11-17
**Versión:** 1.0
