import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define routes that require authentication
  const isProtectedAdminRoute = path.startsWith('/admin') && !path.startsWith('/admin/login');
  const isProtectedApiRoute = path.startsWith('/api/admin') && !path.startsWith('/api/admin/login');

  if (isProtectedAdminRoute || isProtectedApiRoute) {
    const sessionCookie = request.cookies.get('admin_session');

    // If no cookie is found, restrict access
    if (!sessionCookie || !sessionCookie.value) {
      if (isProtectedApiRoute) {
        // Return 401 for API routes
        return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
      } else {
        // Redirect to login page for frontend routes
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }
  }

  // Allow all other requests to proceed
  return NextResponse.next();
}

// Ensure the middleware is only invoked for specific paths for performance
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
