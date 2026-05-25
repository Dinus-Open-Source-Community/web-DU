import { NextResponse, type NextRequest } from 'next/server'
import { AUTH_COOKIE_ROLE, AUTH_COOKIE_TOKEN, ROLE_DASHBOARD_PATH, ROLE_ROUTE_PREFIX, type UserRole } from '@/lib/auth/session'

const parseRole = (value: string | undefined): UserRole | null => {
  if (!value) return null
  // Handle multiple role formats: "mentor", "MENTOR", "mentor_role", "MENTOR_ROLE", etc.
  const cleaned = String(value)
    .toLowerCase()
    .replace(/_role$/, '')
    .replace(/role$/, '')
    .trim()

  if (cleaned === 'admin' || cleaned === 'mentor' || cleaned === 'student') {
    return cleaned as UserRole
  }
  return null
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get(AUTH_COOKIE_TOKEN)?.value
  const roleFromCookie = req.cookies.get(AUTH_COOKIE_ROLE)?.value
  const role = parseRole(roleFromCookie)

  const isAuthPage = pathname === '/auth' || pathname.startsWith('/auth/')
  const isPublicPage = pathname === '/' || pathname.startsWith('/courses') || pathname.startsWith('/public')

  // Check if pathname is a protected route based on role prefixes
  const isProtectedRoute = pathname.startsWith('/admin') || pathname.startsWith('/mentor') || pathname.startsWith('/student') || pathname.startsWith('/profile')

  // === SCENARIO 1: User on auth page ===
  // If user has token and is on auth page, redirect to appropriate dashboard
  if (token && isAuthPage) {
    // If we have a role in the cookie, use it
    // Otherwise allow the client to handle redirect (it will fetch the profile)
    if (role) {
      const target = ROLE_DASHBOARD_PATH[role]
      return NextResponse.redirect(new URL(target, req.url))
    }
    // If no role in cookie yet, let client handle it
    return NextResponse.next()
  }

  // === SCENARIO 2: User on public page ===
  // Always allow access to public pages (no auth needed)
  if (isPublicPage) {
    return NextResponse.next()
  }

  // === SCENARIO 3: User trying to access protected routes ===
  if (isProtectedRoute) {
    // If no token, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    // If token exists but no role in cookie yet (probably just logged in)
    // Allow through - the client-side app will handle any necessary redirect
    if (!role) {
      return NextResponse.next()
    }

    // If we have both token and role, validate role matches the route
    const roles = Object.keys(ROLE_ROUTE_PREFIX) as UserRole[]
    for (const roleKey of roles) {
      const prefix = ROLE_ROUTE_PREFIX[roleKey]
      const matches = pathname === prefix || pathname.startsWith(`${prefix}/`)

      // If this route belongs to a different role, redirect to user's correct dashboard
      if (matches && roleKey !== role) {
        const target = ROLE_DASHBOARD_PATH[role]
        return NextResponse.redirect(new URL(target, req.url))
      }
    }

    // Role matches the route, allow access
    return NextResponse.next()
  }

  // Default: allow navigation
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
