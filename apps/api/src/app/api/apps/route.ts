import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAuth } from '@/middleware/auth';
import { appSchema } from '@/schemas/app';
import type { AppResponse, AppsResponse } from '@/types/app';
import { ZodError } from 'zod';

// Create a database client using the connection URL
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
    const { data: apps, error } = await db
      .from('apps')
      .select('*')
      .eq('user_id', authResult.user.id)
      .order('created_at', { ascending: false });

    if (error) {
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
      { success: false, message: 'Failed to fetch apps' },
      { status: 500 }
    );
  }
}

// Create a new app
export async function POST(request: Request) {
  const authResult = await verifyAuth(request);

  if ('error' in authResult) {
    return NextResponse.json(
      { success: false, message: authResult.error.message },
      { status: authResult.error.status }
    );
  }

  try {
    const body = await request.json();
    const validatedData = appSchema.parse(body);

    const { data: app, error } = await db.from('apps').insert([
      {
        name: validatedData.name,
        webhook_url: validatedData.webhookUrl,
        auth_header: validatedData.authHeader,
        user_id: authResult.user.id,
      },
    ]).select().single();

    if (error) {
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
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating app:', error);

    if (error instanceof ZodError) {
      return NextResponse.json<AppResponse>(
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
      { success: false, message: 'Failed to create app' },
      { status: 500 }
    );
  }
} 