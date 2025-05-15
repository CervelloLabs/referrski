import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/middleware/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { sendWebhook } from '@/lib/webhook';
import { WebhookPayload } from '@/types/webhook';

const testCreateWebhookSchema = z.object({
  type: z.literal('create'),
  inviterId: z.string(),
  inviteeIdentifier: z.string().email(),
  metadata: z.record(z.any()).optional(),
});

const testVerifyWebhookSchema = z.object({
  type: z.literal('verify'),
  inviteeIdentifier: z.string().email(),
  invitationId: z.string().uuid().optional(),
});

const testWebhookSchema = z.discriminatedUnion('type', [
  testCreateWebhookSchema,
  testVerifyWebhookSchema,
]);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await verifyAuth(request);

  if ('error' in authResult) {
    return NextResponse.json(
      { success: false, message: authResult.error.message },
      { status: authResult.error.status }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    
    const validatedData = testWebhookSchema.parse(body);

    // Check if app exists and user has access
    const { data: app, error: appError } = await supabaseAdmin
      .from('apps')
      .select('*')
      .eq('id', id)
      .eq('user_id', authResult.user.id)
      .single();

    if (appError) {
      console.error('Database error:', appError);
      return NextResponse.json(
        { success: false, message: 'App not found' },
        { status: 404 }
      );
    }

    if (!app.webhook_url) {
      return NextResponse.json(
        { success: false, message: 'No webhook URL configured for this app' },
        { status: 400 }
      );
    }

    let payload;
    let responseMessage;

    if (validatedData.type === 'create') {
      // Create a test invitation payload
      const invitationId = uuidv4();
      const now = new Date().toISOString();
      
      payload = {
        type: 'invitation.created' as const,
        data: {
          id: invitationId,
          inviterId: validatedData.inviterId,
          inviteeIdentifier: validatedData.inviteeIdentifier,
          status: 'pending',
          metadata: validatedData.metadata || {},
          createdAt: now,
        },
      };
      
      responseMessage = 'Test create invitation webhook sent';
    } else {
      // Create a test verification payload
      const now = new Date().toISOString();
      
      payload = {
        type: 'invitation.completed' as const,
        data: {
          id: validatedData.invitationId || uuidv4(),
          inviteeIdentifier: validatedData.inviteeIdentifier,
          status: 'completed',
          completedAt: now,
        },
      };
      
      responseMessage = 'Test verify invitation webhook sent';
    }

    // Send the webhook
    try {
      const webhookPayload: WebhookPayload = payload;
      
      const webhookResponse = await sendWebhook(app.webhook_url, app.auth_header, webhookPayload);
      
      const statusCode = webhookResponse.status;
      let responseBody;
      
      try {
        responseBody = await webhookResponse.text();
      } catch (e) {
        responseBody = 'Could not parse response body';
      }

      return NextResponse.json({
        success: true,
        message: responseMessage,
        data: {
          payload,
          webhookResponse: {
            status: statusCode,
            body: responseBody,
          },
        },
      });
    } catch (webhookError) {
      console.error('Webhook delivery error:', webhookError);
      return NextResponse.json(
        { 
          success: false, 
          message: `Failed to deliver webhook: ${webhookError instanceof Error ? webhookError.message : 'Unknown error'}`,
          data: { payload } 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing webhook test:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'An unexpected error occurred' 
      },
      { status: 400 }
    );
  }
} 