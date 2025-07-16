import { NextResponse, NextRequest } from 'next/server';
import { rateLimit } from '@daveyplate/next-rate-limit';
import { z } from 'zod';
import { verifyAuth } from '@/middleware/auth';
import { supabaseAdmin } from '@/lib/supabase';

const deleteInviterSchema = z.object({
  email: z.string().email(),
});

export async function DELETE(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    // Rate limiting - 5 requests per minute
    const response = NextResponse.next();
    await rateLimit({
      request,
      response,
      sessionLimit: 5,
      sessionWindow: 60,
      ipLimit: 10,
      ipWindow: 60
    });

    // Validate email parameter
    const { email } = deleteInviterSchema.parse({ email: params.email });

    // Verify authentication
    const authResult = await verifyAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error.message },
        { status: authResult.error.status }
      );
    }

    // Get all apps owned by the user
    const { data: userApps, error: appsError } = await supabaseAdmin
      .from('apps')
      .select('id')
      .eq('user_id', authResult.user.id);

    if (appsError) {
      console.error('Error fetching user apps:', appsError);
      return NextResponse.json(
        { error: 'Failed to verify app ownership' },
        { status: 500 }
      );
    }

    if (!userApps || userApps.length === 0) {
      return NextResponse.json(
        { error: 'No apps found for this user' },
        { status: 403 }
      );
    }

    // Get all invitations associated with the inviter email
    const { data: invitations, error: invitationsError } = await supabaseAdmin
      .from('invitations')
      .select('app_id')
      .eq('inviter_id', email);

    if (invitationsError) {
      console.error('Error fetching invitations:', invitationsError);
      return NextResponse.json(
        { error: 'Failed to fetch inviter data' },
        { status: 500 }
      );
    }

    // Check if any of the invitations belong to the user's apps
    const userAppIds = new Set(userApps.map(app => app.id));
    const hasAccess = invitations?.some(inv => userAppIds.has(inv.app_id));

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'No access to this inviter\'s data' },
        { status: 403 }
      );
    }

    // Delete inviter data from all the user's apps
    const { error: deleteError } = await supabaseAdmin
      .from('invitations')
      .delete()
      .eq('inviter_id', email)
      .in('app_id', Array.from(userAppIds));

    if (deleteError) {
      console.error('Failed to delete inviter data:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete inviter data' },
        { status: 500 }
      );
    }

    // Log the deletion
    await supabaseAdmin.from('admin_logs').insert({
      action: 'delete_inviter',
      admin_id: authResult.user.id,
      target_email: email,
      details: 'Inviter data deleted by app owner'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    console.error('Error in delete inviter endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 