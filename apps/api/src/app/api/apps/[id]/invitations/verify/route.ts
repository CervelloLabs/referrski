import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyMobileAuth } from '@/middleware/mobileAuth';
import { verifyInvitationSchema } from '@/schemas/invitation';
import type { InvitationResponse } from '@/types/invitation';
import { ZodError } from 'zod';
import { sendWebhook } from '../../../../../../lib/webhook';
import { WebhookPayload } from '../../../../../../types/webhook';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const isAuthenticated = await verifyMobileAuth(request, id);

  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Get the app details directly since we've already verified auth
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

    const body = await request.json();
    const validatedData = verifyInvitationSchema.parse(body);

    // Find the invitation
    let invitationQuery = supabaseAdmin
      .from('invitations')
      .select('*')
      .eq('app_id', id)
      .eq('invitee_identifier', validatedData.inviteeIdentifier)
      .eq('status', 'pending');

    if (validatedData.invitationId) {
      invitationQuery = invitationQuery.eq('id', validatedData.invitationId);
    }

    const { data: invitation, error: fetchError } = await invitationQuery.single();

    if (fetchError || !invitation) {
      return NextResponse.json(
        { success: false, message: 'No valid invitation found' },
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
    if (app.webhook_url) {
      try {
        const webhookPayload: WebhookPayload = {
          type: 'invitation.completed',
          data: {
            invitationId: updatedInvitation.id,
            appId: updatedInvitation.app_id,
            inviterId: updatedInvitation.inviter_id,
            inviteeIdentifier: updatedInvitation.invitee_identifier,
            status: updatedInvitation.status,
            metadata: updatedInvitation.metadata,
            createdAt: updatedInvitation.created_at,
            completedAt: updatedInvitation.completed_at,
          },
        };
        
        await sendWebhook(app.webhook_url, app.auth_header, webhookPayload);
      } catch (webhookError) {
        console.error('Webhook notification failed:', webhookError);
        // Don't fail the request if webhook fails
      }
    }

    return NextResponse.json<InvitationResponse>(
      {
        success: true,
        data: {
          invitation: {
            id: updatedInvitation.id,
            appId: updatedInvitation.app_id,
            inviterId: updatedInvitation.inviter_id,
            inviteeIdentifier: updatedInvitation.invitee_identifier,
            status: updatedInvitation.status,
            metadata: updatedInvitation.metadata,
            createdAt: updatedInvitation.created_at,
            updatedAt: updatedInvitation.updated_at,
            completedAt: updatedInvitation.completed_at,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifying invitation:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to verify invitation',
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    );
  }
} 