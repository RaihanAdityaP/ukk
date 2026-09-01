import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/cart/:path*', '/checkout/:path*', '/profile/:path*'],
}
