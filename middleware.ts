import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getCSP, generateNonce } from "./lib/csp"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-storage")?.value
  const isAuthPage = request.nextUrl.pathname.startsWith("/login")
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard")

  // If trying to access dashboard without token, redirect to login
  if (isDashboard && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If trying to access login with token, redirect to dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  const response = NextResponse.next()
  
  // Generate nonce for CSP
  const nonce = generateNonce()

  // Set Content Security Policy
  response.headers.set('Content-Security-Policy', getCSP(nonce))
  
  // Store nonce for use in HTML (if needed)
  response.headers.set('X-Nonce', nonce)

  // Add Cache-Control headers for sensitive pages
  if (isAuthPage || isDashboard) {
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
    )
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }

  // Ensure proper Content-Type for HTML responses
  const pathname = request.nextUrl.pathname
  if (!pathname.includes('.') && !pathname.startsWith('/_next')) {
    response.headers.set('Content-Type', 'text/html; charset=utf-8')
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
