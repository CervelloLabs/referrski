import { supabaseAdmin } from '@/lib/supabase';

export async function verifyMobileAuth(request: Request, appId: string): Promise<boolean> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.split(' ')[1];
  
  // First get the app by ID
  const { data: app, error } = await supabaseAdmin
    .from('apps')
    .select('auth_header')
    .eq('id', appId)
    .single();

  if (error || !app) {
    return false;
  }

  // Then check if the auth_header matches the token
  return app.auth_header === token;
}
