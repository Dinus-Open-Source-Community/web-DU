import { NextResponse, type NextRequest } from 'next/server'
import { AUTH_COOKIE_ROLE, AUTH_COOKIE_TOKEN, ROLE_DASHBOARD_PATH, ROLE_ROUTE_PREFIX, type UserRole } from '@/lib/auth/session'

const parseRole = (value: string | undefined): UserRole | null => {
  if (!value) return null
  if (value === 'admin' || value === 'mentor' || value === 'student') return value
  return null
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get(AUTH_COOKIE_TOKEN)?.value
  const role = parseRole(req.cookies.get(AUTH_COOKIE_ROLE)?.value)
  const isAuthPage = pathname === '/auth' || pathname.startsWith('/auth/')

  if (token && isAuthPage) {
    const target = role ? ROLE_DASHBOARD_PATH[role] : '/student/dashboard'
    return NextResponse.redirect(new URL(target, req.url))
  }

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  if (!role) {
    return NextResponse.next()
  }

  const roles = Object.keys(ROLE_ROUTE_PREFIX) as UserRole[]
  for (const roleKey of roles) {
    const prefix = ROLE_ROUTE_PREFIX[roleKey]
    const matches = pathname === prefix || pathname.startsWith(`${prefix}/`)
    if (matches && roleKey !== role) {
      const target = ROLE_DASHBOARD_PATH[role]
      return NextResponse.redirect(new URL(target, req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/auth/:path*', '/admin/:path*', '/mentor/:path*', '/student/:path*'],
}
