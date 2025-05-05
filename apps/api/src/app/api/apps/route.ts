import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { verifyAuth } from '@/middleware/auth';
import { appSchema } from '@/schemas/app';
import type { AppResponse, AppsResponse } from '@/types/app';
import { ZodError } from 'zod';

// List all apps for the authenticated user
export async function GET(request: Request) {
  const authResult = await verifyAuth(request);

  if ('error' in authResult) {
    return NextResponse.json(
      { success: false, message: authResult.error.message },
      { status: authResult.error.status }
    );
  }

  try {
    const { data: apps, error } = await supabaseAdmin
      .from('apps')
      .select('*')
      .eq('user_id', authResult.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    return NextResponse.json<AppsResponse>(
      {
        success: true,
        data: {
          apps: apps.map(app => ({
            id: app.id,
            name: app.name,
            webhookUrl: app.webhook_url,
            authHeader: app.auth_header,
            userId: app.user_id,
            createdAt: app.created_at,
            updatedAt: app.updated_at,
          })),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching apps:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch apps',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// Create a new app
export async function POST(request: Request) {
  const authResult = await verifyAuth(request);

  if ('error' in authResult) {
    console.error('Auth error:', authResult.error);
    return NextResponse.json(
      { success: false, message: authResult.error.message },
      { status: authResult.error.status }
    );
  }

  try {
    const body = await request.json();
    console.log('Received body:', body);
    
    const validatedData = appSchema.parse(body);
    console.log('Validated data:', validatedData);

    const { data: app, error } = await supabaseAdmin
      .from('apps')
      .insert({
        name: validatedData.name,
        webhook_url: validatedData.webhookUrl,
        auth_header: validatedData.authHeader,
        user_id: authResult.user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!app) {
      throw new Error('Failed to create app: No data returned');
    }

    console.log('Created app:', app);

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
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating app:', error);

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
        message: error instanceof Error ? error.message : 'Failed to create app',
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    );
  }
} 