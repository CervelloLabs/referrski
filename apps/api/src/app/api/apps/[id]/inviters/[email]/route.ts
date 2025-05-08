import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string; email: string } }
) {
  try {
    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Check if user has access to this app
    const { data: app, error: appError } = await supabase
      .from('apps')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (appError || !app) {
      return new Response('App not found or access denied', { status: 404 });
    }

    // Delete all invitations for this app and inviter email
    const { error: deleteError } = await supabase
      .from('invitations')
      .delete()
      .eq('app_id', params.id)
      .eq('inviter_id', decodeURIComponent(params.email));

    if (deleteError) {
      console.error('Error deleting invitations:', deleteError);
      return new Response('Failed to delete invitations', { status: 500 });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error in DELETE /api/apps/[id]/inviters/[email]:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 