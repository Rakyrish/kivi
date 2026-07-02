import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value
  const { pathname } = request.nextUrl

  // Check if it's an admin route
  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginRoute = pathname === '/admin/login'

  if (isAdminRoute) {
    if (!token && !isLoginRoute) {
      // Redirect to login if trying to access admin pages without token
      const url = new URL('/admin/login', request.url)
      return NextResponse.redirect(url)
    }

    if (token && isLoginRoute) {
      // Redirect to dashboard if logged in but trying to access login page
      const url = new URL('/admin', request.url)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
