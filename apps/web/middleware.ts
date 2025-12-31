import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('saas_access_token')?.value;
  const userRole = request.cookies.get('saas_user_role')?.value;

  if (PUBLIC_PATHS.includes(pathname)) {
    if (accessToken) {
      return NextResponse.redirect(new URL('/app', request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/app')) {
    if (!accessToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (pathname.startsWith('/app/admin') && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/app', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
};
