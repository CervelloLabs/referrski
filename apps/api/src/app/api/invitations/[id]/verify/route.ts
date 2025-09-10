import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { InvitationResponse } from '@/types/invitation';
import { sendWebhook } from '@/lib/webhook';
import { WebhookPayload } from '@/types/webhook';

// Public endpoint to verify/accept invitation by ID (no auth required)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the invitation with app details
    const { data: invitation, error: fetchError } = await supabaseAdmin
      .from('invitations')
      .select(`
        *,
        apps:app_id (
          id,
          name,
          webhook_url,
          auth_header,
          user_id
        )
      `)
      .eq('id', id)
      .eq('status', 'pending') // Only accept pending invitations
      .single();

    if (fetchError || !invitation) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invitation not found or has already been used' 
        },
        { status: 404 }
      );
    }

    // Complete the invitation
    const now = new Date().toISOString();
    const { data: updatedInvitation, error: updateError } = await supabaseAdmin
      .from('invitations')
      .update({
        status: 'completed',
        completed_at: now,
      })
      .eq('id', invitation.id)
      .select()
      .single();

    if (updateError) {
      console.error('Database error:', updateError);
      throw updateError;
    }

    // Send webhook notification if configured
    if (invitation.apps?.webhook_url) {
      try {
        const webhookPayload: WebhookPayload = {
          type: 'invitation.completed',
          data: {
            invitationId: updatedInvitation.id,
            appId: updatedInvitation.app_id,
            inviterId: updatedInvitation.inviter_id,
            inviteeIdentifier: updatedInvitation.invitee_identifier,
            status: 'completed',
            metadata: updatedInvitation.metadata || {},
            createdAt: updatedInvitation.created_at,
            completedAt: updatedInvitation.completed_at,
          },
        };

        await sendWebhook(
          invitation.apps.webhook_url,
          invitation.apps.auth_header,
          webhookPayload
        );
      } catch (webhookError) {
        console.error('Webhook delivery failed:', webhookError);
        // Don't fail the request if webhook fails
      }
    }

    return NextResponse.json<InvitationResponse>(
      {
        success: true,
        message: 'Invitation accepted successfully',
        data: {
          invitation: {
            id: updatedInvitation.id,
            appId: updatedInvitation.app_id,
            inviterId: updatedInvitation.inviter_id,
            inviteeIdentifier: updatedInvitation.invitee_identifier,
            status: updatedInvitation.status as 'completed',
            metadata: updatedInvitation.metadata,
            createdAt: updatedInvitation.created_at,
            updatedAt: updatedInvitation.updated_at,
            completedAt: updatedInvitation.completed_at,
            appName: invitation.apps?.name
          }
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifying invitation:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
