import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAuth } from '@/middleware/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verify authentication
    const authResult = await verifyAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, message: authResult.error.message },
        { status: authResult.error.status }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get('period') || '30');

    // Get app details and verify user owns it
    const { data: app, error: appError } = await supabaseAdmin
      .from('apps')
      .select('id, name, user_id')
      .eq('id', id)
      .eq('user_id', authResult.user.id)
      .single();

    if (appError || !app) {
      return NextResponse.json(
        { success: false, message: 'App not found or access denied' },
        { status: 404 }
      );
    }

    // Get overall funnel metrics
    const { data: funnelMetrics, error: funnelError } = await supabaseAdmin
      .rpc('get_invitation_funnel_metrics', { app_uuid: id });

    if (funnelError) {
      console.error('Error fetching funnel metrics:', funnelError);
      throw funnelError;
    }

    // Get period-specific metrics
    const { data: periodMetrics, error: periodError } = await supabaseAdmin
      .rpc('get_invitation_metrics_by_period', { 
        app_uuid: id, 
        period_days: period 
      });

    if (periodError) {
      console.error('Error fetching period metrics:', periodError);
      throw periodError;
    }

    // Get detailed breakdown by status
    const { data: invitations, error: invitationsError } = await supabaseAdmin
      .from('invitations')
      .select('status, completed_at, signed_up_at, created_at')
      .eq('app_id', id)
      .gte('created_at', new Date(Date.now() - period * 24 * 60 * 60 * 1000).toISOString());

    if (invitationsError) {
      console.error('Error fetching invitations:', invitationsError);
      throw invitationsError;
    }

    // Calculate daily breakdown
    const dailyBreakdown = calculateDailyBreakdown(invitations, period);

    return NextResponse.json({
      success: true,
      data: {
        app: {
          id: app.id,
          name: app.name
        },
        overall: funnelMetrics[0] || {
          total_invitations: 0,
          invitations_accepted: 0,
          invitations_signed_up: 0,
          acceptance_rate: 0,
          signup_rate: 0,
          conversion_rate: 0
        },
        period: {
          days: period,
          ...periodMetrics[0] || {
            total_invitations: 0,
            invitations_accepted: 0,
            invitations_signed_up: 0,
            acceptance_rate: 0,
            signup_rate: 0,
            conversion_rate: 0
          }
        },
        daily_breakdown: dailyBreakdown
      }
    });

  } catch (error) {
    console.error('Metrics error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

function calculateDailyBreakdown(invitations: any[], periodDays: number) {
  const days = [];
  const now = new Date();
  
  for (let i = periodDays - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const dayInvitations = invitations.filter(inv => {
      const createdAt = new Date(inv.created_at);
      return createdAt >= date && createdAt < nextDate;
    });
    
    const total = dayInvitations.length;
    const accepted = dayInvitations.filter(inv => inv.completed_at).length;
    const signedUp = dayInvitations.filter(inv => inv.signed_up_at).length;
    
    days.push({
      date: date.toISOString().split('T')[0],
      total_invitations: total,
      invitations_accepted: accepted,
      invitations_signed_up: signedUp,
      acceptance_rate: total > 0 ? Math.round((accepted / total) * 100 * 100) / 100 : 0,
      signup_rate: accepted > 0 ? Math.round((signedUp / accepted) * 100 * 100) / 100 : 0,
      conversion_rate: total > 0 ? Math.round((signedUp / total) * 100 * 100) / 100 : 0
    });
  }
  
  return days;
}
