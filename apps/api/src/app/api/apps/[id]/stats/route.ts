import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAuth } from '@/middleware/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const authResult = await verifyAuth(request);
  if ('error' in authResult) {
    return NextResponse.json(authResult.error, { status: authResult.error.status });
  }

  try {
    // Get unique invites count
    const { count: uniqueInvites } = await supabaseAdmin
      .from('invitations')
      .select('invitee_identifier', { count: 'exact', head: true })
      .eq('app_id', params.id)
      .is('deleted_at', null);

    // Get completed invites count (signed up users)
    const { count: completedInvites } = await supabaseAdmin
      .from('invitations')
      .select('invitee_identifier', { count: 'exact', head: true })
      .eq('app_id', params.id)
      .eq('status', 'completed')
      .is('deleted_at', null);

    return NextResponse.json({
      success: true,
      data: {
        uniqueInvites: uniqueInvites || 0,
        completedInvites: completedInvites || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching app stats:', error);
    return NextResponse.json(
      { message: 'Failed to fetch app statistics' },
      { status: 500 }
    );
  }
} 