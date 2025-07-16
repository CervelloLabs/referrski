import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyMobileAuth } from '@/middleware/mobileAuth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; email: string }> }
) {
  try {
    const { id, email } = await params;
    
    // Use mobile auth verification (same as invite creation endpoint)
    const isAuthenticated = await verifyMobileAuth(request, id);

    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the app details (auth already verified for this app)
    const { data: app, error: appError } = await supabaseAdmin
      .from('apps')
      .select('*')
      .eq('id', id)
      .single();

    if (appError || !app) {
      return NextResponse.json(
        { success: false, message: 'App not found' },
        { status: 404 }
      );
    }

    // Delete all invitations for this app and inviter email
    const { error: deleteError } = await supabaseAdmin
      .from('invitations')
      .delete()
      .eq('app_id', id)
      .eq('inviter_id', decodeURIComponent(email));

    if (deleteError) {
      console.error('Error deleting invitations:', deleteError);
      return NextResponse.json(
        { success: false, message: 'Failed to delete invitations' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/apps/[id]/inviters/[email]:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 