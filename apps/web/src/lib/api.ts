// API client interface
interface FetchOptions extends RequestInit {
  body?: any;
}

// Store the session token in memory
let sessionToken: string | null = null;

export { sessionToken };

export function setSessionToken(token: string | null) {
  sessionToken = token;
}

export async function fetchApi(endpoint: string, options: FetchOptions = {}) {
  if (!sessionToken && !endpoint.includes('/auth/')) {
    throw new Error('Not authenticated');
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const baseUrl = API_URL.replace(/\/+$/, '');
  const cleanEndpoint = endpoint.replace(/^\/+/, '/');
  const url = `${baseUrl}${cleanEndpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(sessionToken && { 'Authorization': `Bearer ${sessionToken}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
} 