import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    const hasAdminAuth = request.cookies.has('admin_auth')
    const hasUserAuth = request.cookies.has('user_auth')
    const isAuthenticated = hasAdminAuth || hasUserAuth

    // Redirect to login if not authenticated
    if (!isAuthenticated && pathname !== '/login') {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Redirect to home if already authenticated and trying to hit login
    if (isAuthenticated && pathname === '/login') {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         * - files in public folder (like images)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf|docx|doc|txt)$).*)',
    ],
}
