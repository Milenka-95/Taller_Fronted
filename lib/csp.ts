/**
 * Content Security Policy Configuration
 * 
 * This file contains the CSP configuration for the application.
 * The CSP is designed to be strict while allowing Next.js to function properly.
 */

export function getCSP(): string {
  const isDev = process.env.NODE_ENV === 'development'
  
  // Generate CSP directives
  const cspDirectives = [
    // Default source - only allow resources from same origin
    "default-src 'self'",
    
    // Script sources
    // In production: Use 'strict-dynamic' to allow dynamically loaded scripts
    // 'unsafe-eval' only in development for hot reloading
    isDev
      ? "script-src 'self' 'unsafe-eval' https://va.vercel-scripts.com"
      : "script-src 'self' https://va.vercel-scripts.com",
    
    // Style sources - Next.js requires some inline styles
    // Using specific hashes would be ideal but they change with each build
    "style-src 'self'",
    
    // Image sources - Allow self, data URIs, and HTTPS images
    "img-src 'self' data: https:",
    
    // Font sources - Allow self and data URIs
    "font-src 'self' data:",
    
    // Connection sources - Allow API and analytics endpoints
    "connect-src 'self' http://localhost:8080 https://vitals.vercel-insights.com" + (isDev ? " ws://localhost:3000 ws://localhost:*" : ""),
    
    // Frame ancestors - Prevent clickjacking
    "frame-ancestors 'none'",
    
    // Base URI - Prevent base tag injection
    "base-uri 'self'",
    
    // Form action - Only allow forms to submit to same origin
    "form-action 'self'",
    
    // Object sources - Block plugins like Flash
    "object-src 'none'",
    
    // Upgrade insecure requests in production
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ]
  
  return cspDirectives.join('; ')
}

