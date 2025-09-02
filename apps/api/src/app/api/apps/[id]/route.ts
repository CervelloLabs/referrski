import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAuth } from '@/middleware/auth';
import { appSchema } from '@/schemas/app';
import type { AppResponse } from '@/types/app';
import { ZodError } from 'zod';

  // Get app details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authResult = await verifyAuth(request);

  if ('error' in authResult) {
    return NextResponse.json(
      { success: false, message: authResult.error.message },
      { status: authResult.error.status }
    );
  }

  try {
    // Verify the app belongs to the user
    const { data: app, error } = await supabaseAdmin
      .from('apps')
      .select('*')
      .eq('id', id)
      .eq('user_id', authResult.user.id)
      .single();

    if (error || !app) {
      return NextResponse.json(
        { success: false, message: 'App not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<AppResponse>(
      {
        success: true,
        data: {
          app: {
            id: app.id,
            name: app.name,
            webhookUrl: app.webhook_url,
            authHeader: app.auth_header,
            userId: app.user_id,
            createdAt: app.created_at,
            updatedAt: app.updated_at,
            iosAppUrl: app.ios_app_url,
            androidAppUrl: app.android_app_url,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching app details:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch app details' 
      },
      { status: 500 }
    );
  }
}

// Update an app
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { data: existingApp, error: fetchError } = await supabaseAdmin
      .from('apps')
      .select('*')
      .eq('id', id)
      .eq('user_id', authResult.user.id)
      .single();

    if (fetchError || !existingApp) {
      return NextResponse.json(
        { success: false, message: 'App not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = appSchema.parse(body);

    const { data: app, error } = await supabaseAdmin
      .from('apps')
      .update({
        name: validatedData.name,
        webhook_url: validatedData.webhookUrl,
        auth_header: validatedData.authHeader,
        ios_app_url: validatedData.iosAppUrl,
        android_app_url: validatedData.androidAppUrl,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    return NextResponse.json<AppResponse>(
      {
        success: true,
        data: {
          app: {
            id: app.id,
            name: app.name,
            webhookUrl: app.webhook_url,
            authHeader: app.auth_header,
            userId: app.user_id,
            createdAt: app.created_at,
            updatedAt: app.updated_at,
            iosAppUrl: app.ios_app_url,
            androidAppUrl: app.android_app_url,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating app:', error);

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
        message: error instanceof Error ? error.message : 'Failed to update app',
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    );
  }
}

// Delete an app
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { data: existingApp, error: fetchError } = await supabaseAdmin
      .from('apps')
      .select('*')
      .eq('id', id)
      .eq('user_id', authResult.user.id)
      .single();

    if (fetchError || !existingApp) {
      return NextResponse.json(
        { success: false, message: 'App not found' },
        { status: 404 }
      );
    }

    const { error } = await supabaseAdmin
      .from('apps')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json(
      { success: true, message: 'App deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting app:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete app' },
      { status: 500 }
    );
  }
} 