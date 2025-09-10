import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyMobileAuth } from '@/middleware/mobileAuth';
import { z } from 'zod';
import { sendWebhook } from '@/lib/webhook';
import { WebhookPayload } from '@/types/webhook';

const validateSignupSchema = z.object({
  userThatSignedUpId: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verify authentication
    const isAuthenticated = await verifyMobileAuth(request, id);
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the app details
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
    const validatedData = validateSignupSchema.parse(body);

    // Find the completed invitation that matches the user identifier
    const { data: invitation, error: fetchError } = await supabaseAdmin
      .from('invitations')
      .select('*')
      .eq('app_id', id)
      .eq('invitee_identifier', validatedData.userThatSignedUpId) // Match by user identifier
      .eq('status', 'completed') // Only look for completed invitations
      .is('signed_up_at', null) // Not already marked as signed up
      .single();

    if (fetchError || !invitation) {
      return NextResponse.json(
        { 
          success: true, 
          validated: false, 
          message: 'No matching completed invitation found for this user identifier'
        },
        { status: 200 }
      );
    }

    // Update the invitation to mark that the user has signed up
    const now = new Date().toISOString();
    const { data: updatedInvitation, error: updateError } = await supabaseAdmin
      .from('invitations')
      .update({
        signed_up_at: now,
        signed_up_user_id: validatedData.userThatSignedUpId,
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
          type: 'invitation.signup_completed',
          data: {
            invitationId: updatedInvitation.id,
            appId: updatedInvitation.app_id,
            inviterId: updatedInvitation.inviter_id,
            inviteeIdentifier: updatedInvitation.invitee_identifier,
            status: 'completed',
            metadata: updatedInvitation.metadata || {},
            createdAt: updatedInvitation.created_at,
            completedAt: updatedInvitation.completed_at,
            signedUpAt: updatedInvitation.signed_up_at,
            signedUpUserId: updatedInvitation.signed_up_user_id,
          },
        };

        await sendWebhook(app.webhook_url, app.auth_header, webhookPayload);
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
        // Don't fail the request if webhook fails
      }
    }

    return NextResponse.json({
      success: true,
      validated: true,
      message: 'User signup validated successfully',
      data: {
        invitation: updatedInvitation
      }
    });

  } catch (error) {
    console.error('Validate signup error:', error);

    if (error instanceof z.ZodError) {
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
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
