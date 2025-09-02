import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { InvitationResponse } from '@/types/invitation';

// Public endpoint to get invitation details by ID (no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the invitation with app details
    const { data: invitation, error } = await supabaseAdmin
      .from('invitations')
      .select(`
        *,
        apps:app_id (
          id,
          name,
          user_id
        )
      `)
      .eq('id', id)
      .eq('status', 'pending') // Only return pending invitations
      .single();

    if (error || !invitation) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invitation not found or has already been used' 
        },
        { status: 404 }
      );
    }

    // Return invitation details (without sensitive app info)
    return NextResponse.json<InvitationResponse>(
      {
        success: true,
        data: {
          invitation: {
            id: invitation.id,
            appId: invitation.app_id,
            inviterId: invitation.inviter_id,
            inviteeIdentifier: invitation.invitee_identifier,
            status: invitation.status,
            metadata: invitation.metadata,
            createdAt: invitation.created_at,
            updatedAt: invitation.updated_at,
            completedAt: invitation.completed_at,
            // Include app name for display
            appName: invitation.apps?.name || 'Unknown App'
          } as any // Extend the type to include appName
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
