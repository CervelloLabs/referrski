import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { supabaseAdmin, validateEnv } from '@/lib/supabase';
import { verifyAuth } from '@/middleware/auth';
import { createInvitationSchema } from '@/schemas/invitation';
import type { InvitationResponse, InvitationsResponse } from '@/types/invitation';
import { ZodError } from 'zod';
import { generateInvitationEmail } from '@/lib/email-templates';
import { sendEmail } from '@/lib/email';

// List invitations for an app
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate environment variables at runtime
    validateEnv();
    
    const { id } = await params;
    const authResult = await verifyAuth(request);

    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, message: authResult.error.message },
        { status: authResult.error.status }
      );
    }

    try {
      // First, verify the app belongs to the user
      const { data: app, error: appError } = await supabaseAdmin
        .from('apps')
        .select('*')
        .eq('id', id)
        .eq('user_id', authResult.user.id)
        .single();

      if (appError || !app) {
        return NextResponse.json(
          { success: false, message: 'App not found' },
          { status: 404 }
        );
      }

      // Get invitations for the app
      const { data: invitations, error } = await supabaseAdmin
        .from('invitations')
        .select('*')
        .eq('app_id', id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      return NextResponse.json<InvitationsResponse>(
        {
          success: true,
          data: {
            invitations: invitations.map(invitation => ({
              id: invitation.id,
              appId: invitation.app_id,
              inviterId: invitation.inviter_id,
              inviteeIdentifier: invitation.invitee_identifier,
              status: invitation.status,
              metadata: invitation.metadata,
              createdAt: invitation.created_at,
              updatedAt: invitation.updated_at,
              completedAt: invitation.completed_at,
            })),
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error fetching invitations:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to fetch invitations',
          details: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in GET invitations:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// Create a new invitation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    validateEnv();
    
    const { id } = await params;
    const authResult = await verifyAuth(request);

    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, message: authResult.error.message },
        { status: authResult.error.status }
      );
    }

    try {
      // First, verify the app belongs to the user
      const { data: app, error: appError } = await supabaseAdmin
        .from('apps')
        .select('*')
        .eq('id', id)
        .eq('user_id', authResult.user.id)
        .single();

      if (appError || !app) {
        return NextResponse.json(
          { success: false, message: 'App not found' },
          { status: 404 }
        );
      }

      const body = await request.json();
      const validatedData = createInvitationSchema.parse(body);

      // Validate email format if email sending is requested
      if (validatedData.email && !validatedData.inviteeIdentifier.includes('@')) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Invalid email address',
            errors: [{
              field: 'inviteeIdentifier',
              message: 'Must be a valid email address when email sending is enabled'
            }]
          },
          { status: 400 }
        );
      }

      // Create the invitation
      const { data: invitation, error } = await supabaseAdmin
        .from('invitations')
        .insert({
          app_id: id,
          inviter_id: validatedData.inviterId,
          invitee_identifier: validatedData.inviteeIdentifier,
          metadata: validatedData.metadata,
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      // Send email if email configuration is provided
      if (validatedData.email) {
        try {
          const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invitations/${invitation.id}/accept`;

          // Generate email HTML
          const emailHtml = generateInvitationEmail({
            appName: app.name,
            inviterName: validatedData.inviterId,
            inviteeIdentifier: validatedData.inviteeIdentifier,
            customContent: validatedData.email.content,
            acceptUrl,
          });

          // Send the email
          await sendEmail({
            to: validatedData.inviteeIdentifier,
            fromName: validatedData.email.fromName,
            subject: validatedData.email.subject,
            html: emailHtml,
            replyTo: validatedData.inviterId.includes('@') ? validatedData.inviterId : undefined,
          });
        } catch (emailError) {
          console.error('Failed to send invitation email:', emailError);
          // Don't fail the request if email sending fails
        }
      }

      // Send webhook notification if configured
      if (app.webhook_url) {
        try {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          
          if (app.auth_header) {
            headers['Authorization'] = app.auth_header;
          }

          await fetch(app.webhook_url, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              type: 'invitation.created',
              data: {
                id: invitation.id,
                inviterId: invitation.inviter_id,
                inviteeIdentifier: invitation.invitee_identifier,
                status: invitation.status,
                metadata: invitation.metadata,
                createdAt: invitation.created_at,
              },
            }),
          });
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
              id: invitation.id,
              appId: invitation.app_id,
              inviterId: invitation.inviter_id,
              inviteeIdentifier: invitation.invitee_identifier,
              status: invitation.status,
              metadata: invitation.metadata,
              createdAt: invitation.created_at,
              updatedAt: invitation.updated_at,
              completedAt: invitation.completed_at,
            },
          },
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Error creating invitation:', error);

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
          message: error instanceof Error ? error.message : 'Failed to create invitation',
          details: error instanceof Error ? error.stack : String(error)
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in POST invitation:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
} 