import { NextConfig } from 'next';

const config: NextConfig = {
  // Enable CORS for the web app
  async headers() {
    // Define allowed origins
    const allowedOrigins = [
      'https://referrski.vercel.app',    // Production web app
      process.env.NEXT_PUBLIC_APP_URL,   // Dynamic origin from env
    ].filter((origin): origin is string => typeof origin === 'string');

    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { 
            key: 'Access-Control-Allow-Origin', 
            value: process.env.NEXT_PUBLIC_APP_URL && allowedOrigins.includes(process.env.NEXT_PUBLIC_APP_URL)
              ? process.env.NEXT_PUBLIC_APP_URL 
              : 'http://localhost:3000'
          },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
          { key: 'Access-Control-Max-Age', value: '86400' },
        ],
      },
    ];
  },
};

export default config;
