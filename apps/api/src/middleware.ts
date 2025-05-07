import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Define allowed origins
  const allowedOrigins = [
    'https://referrski-web.vercel.app',  // Original Vercel domain for web app
    'https://www.referrski.com',         // New custom domain (www)
    'https://referrski.com',             // New custom domain (apex)
    process.env.NEXT_PUBLIC_APP_URL,     // Dynamic origin from env (e.g., for localhost)
  ].filter((origin): origin is string => typeof origin === 'string');

  const requestOrigin = request.headers.get('origin');
  // Default to a restrictive value or your primary production domain if the origin is not recognized/allowed.
  // This ensures that if an unrecognized origin makes a request, it doesn't get a wildcard or an unintended domain.
  let accessControlAllowOrigin = 'https://www.referrski.com'; 

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    accessControlAllowOrigin = requestOrigin; // Dynamically set to the matched allowed origin
  } else if (requestOrigin) {
    // If the origin is present but NOT in the allowedOrigins list,
    // you might want to log this for review or stick to the default restrictive origin.
    // For this setup, we stick to the default `accessControlAllowOrigin` set above.
    console.warn(`Request from untrusted origin blocked or defaulted: ${requestOrigin}`);
  }
  // If requestOrigin is null (e.g., same-origin request, or server-to-server), 
  // Access-Control-Allow-Origin might not be strictly necessary or can be the default.

  // Handle OPTIONS preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': accessControlAllowOrigin,
        'Access-Control-Allow-Methods': 'GET,DELETE,PATCH,POST,PUT,OPTIONS',
        'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
        'Access-Control-Max-Age': '86400', // 24 hours
      },
    });
  }

  // Add CORS headers to all other responses
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Origin', accessControlAllowOrigin);
  
  return response;
}

export const config = {
  matcher: '/api/:path*',
}; 