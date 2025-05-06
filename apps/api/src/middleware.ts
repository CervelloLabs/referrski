import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Define allowed origins
  const allowedOrigins = [
    'https://referrski-web.vercel.app',  // Production web app
    process.env.NEXT_PUBLIC_APP_URL,     // Dynamic origin from env
  ].filter((origin): origin is string => typeof origin === 'string');

  // Get the request's origin
  const origin = request.headers.get('origin');
  const allowedOrigin = origin && allowedOrigins.includes(origin)
    ? origin
    : 'https://referrski-web.vercel.app';

  // Handle OPTIONS preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'GET,DELETE,PATCH,POST,PUT,OPTIONS',
        'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
        'Access-Control-Max-Age': '86400', // 24 hours
      },
    });
  }

  // Add CORS headers to all responses
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  
  return response;
}

export const config = {
  matcher: '/api/:path*',
}; 