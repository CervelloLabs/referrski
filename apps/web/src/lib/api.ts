import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface FetchOptions extends RequestInit {
  body?: any;
}

export async function fetchApi(endpoint: string, options: FetchOptions = {}) {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    throw new Error('Not authenticated');
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const baseUrl = API_URL.replace(/\/+$/, '');
  const cleanEndpoint = endpoint.replace(/^\/+/, '/');
  const url = `${baseUrl}${cleanEndpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
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