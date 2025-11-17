/**
 * Content Security Policy Configuration
 * 
 * This file contains the CSP configuration for the application.
 * The CSP is designed to be strict while allowing Next.js to function properly.
 */

export function getCSP(nonce?: string): string {
  const isDev = process.env.NODE_ENV === 'development'
  
  // Generate CSP directives
  const cspDirectives = [
    // Default source
    "default-src 'self'",
    
    // Script sources - Use nonce if provided, otherwise allow self
    // Note: 'wasm-unsafe-eval' is needed for Next.js WebAssembly support
    // 'strict-dynamic' allows scripts loaded by trusted scripts to also be trusted
    nonce
      ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://va.vercel-scripts.com`
      : "script-src 'self' https://va.vercel-scripts.com" + (isDev ? " 'unsafe-eval'" : ""),
    
    // Style sources - Use nonce if provided
    nonce
      ? `style-src 'self' 'nonce-${nonce}'`
      : "style-src 'self'",
    
    // Image sources - Allow self, data URIs, and HTTPS images
    "img-src 'self' data: https:",
    
    // Font sources - Allow self and data URIs
    "font-src 'self' data:",
    
    // Connection sources - Allow API and analytics endpoints
    "connect-src 'self' http://localhost:8080 https://vitals.vercel-insights.com",
    
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

/**
 * Generate a cryptographically secure nonce
 */
export function generateNonce(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for environments without crypto.randomUUID
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
