import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAuth } from '@/middleware/auth';

// Maximum number of invites per user (across all apps)
const INVITE_LIMIT = 10;

export async function GET(request: NextRequest) {
  const authResult = await verifyAuth(request);

  if ('error' in authResult) {
    return NextResponse.json(
      { success: false, message: authResult.error.message },
      { status: authResult.error.status }
    );
  }

  try {
    // Get current invite usage
    const { data: inviteUsage, error } = await supabaseAdmin
      .from('user_invite_usage')
      .select('total_invites, updated_at')
      .eq('user_id', authResult.user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: {
        totalInvites: inviteUsage?.total_invites || 0,
        remainingInvites: INVITE_LIMIT - (inviteUsage?.total_invites || 0),
        limit: INVITE_LIMIT,
        lastUpdated: inviteUsage?.updated_at || null
      }
    });
  } catch (error) {
    console.error('Error fetching invite usage:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch invite usage',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 