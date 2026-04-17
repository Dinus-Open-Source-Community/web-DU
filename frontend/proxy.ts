import { NextResponse, type NextRequest } from 'next/server'
import { getActiveUser, ROLE_DASHBOARD_PATH, ROLE_ROUTE_PREFIX, type UserRole } from '@/lib/data/dummyUsers'

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const user = getActiveUser()

  const roles = Object.keys(ROLE_ROUTE_PREFIX) as UserRole[]
  for (const role of roles) {
    const prefix = ROLE_ROUTE_PREFIX[role]
    const matches = pathname === prefix || pathname.startsWith(`${prefix}/`)
    if (matches && role !== user.role) {
      const target = ROLE_DASHBOARD_PATH[user.role]
      return NextResponse.redirect(new URL(target, req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/mentor/:path*', '/student/:path*'],
}
