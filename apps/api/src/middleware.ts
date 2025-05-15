import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from '@daveyplate/next-rate-limit';

// Simple in-memory store - consider using Vercel KV or Redis for production
const ipRateLimits = new Map();
const MAX_REQUESTS = 5; // Adjust as needed
const TIME_WINDOW = 60 * 1000; // 1 minute in milliseconds

// List of blocked IP addresses
const BLOCKED_IPS = ['83.233.246.234']; // Add the spamming IP address

export async function middleware(request: NextRequest) {
  // Block specific IPs before processing anything else
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim();
  if (ip && BLOCKED_IPS.includes(ip)) {
    return new NextResponse(JSON.stringify({ error: 'Access denied' }), {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Define allowed origins
  const allowedOrigins = [
    'https://referrski-web.vercel.app',  // Original Vercel domain for web app
    'https://www.referrski.com',         // New custom domain (www)
    'https://referrski.com',             // New custom domain (apex)
    process.env.NEXT_PUBLIC_APP_URL,     // Dynamic origin from env (e.g., for localhost)
    // Add localhost:3000 for development mode
    process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null,
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

  // Create the base response
  const response = NextResponse.next();
  
  // Set CORS headers
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Origin', accessControlAllowOrigin);

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

  // If this is an API route, apply rate limiting
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Apply rate limiting with stricter limits for API routes
    return await rateLimit({
      request,
      response,
      sessionLimit: 60,   // 60 requests per session window
      ipLimit: 120,       // 120 requests per IP window
      sessionWindow: 60,  // 60 second window for session
      ipWindow: 60,       // 60 second window for IP
    });
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
}; 