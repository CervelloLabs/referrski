import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAuth } from '@/middleware/auth';
import { appSchema } from '@/schemas/app';
import type { AppResponse } from '@/types/app';
import { ZodError } from 'zod';

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Update an app
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const authResult = await verifyAuth(request);

  if ('error' in authResult) {
    return NextResponse.json(
      { success: false, message: authResult.error.message },
      { status: authResult.error.status }
    );
  }

  try {
    // First, verify the app belongs to the user
    const { data: existingApp, error: fetchError } = await db
      .from('apps')
      .select('*')
      .eq('id', params.id)
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

    const { data: app, error } = await db
      .from('apps')
      .update({
        name: validatedData.name,
        webhook_url: validatedData.webhookUrl,
        auth_header: validatedData.authHeader,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

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
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating app:', error);

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
      { success: false, message: 'Failed to update app' },
      { status: 500 }
    );
  }
}

// Delete an app
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const authResult = await verifyAuth(request);

  if ('error' in authResult) {
    return NextResponse.json(
      { success: false, message: authResult.error.message },
      { status: authResult.error.status }
    );
  }

  try {
    // First, verify the app belongs to the user
    const { data: existingApp, error: fetchError } = await db
      .from('apps')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', authResult.user.id)
      .single();

    if (fetchError || !existingApp) {
      return NextResponse.json(
        { success: false, message: 'App not found' },
        { status: 404 }
      );
    }

    const { error } = await db
      .from('apps')
      .delete()
      .eq('id', params.id);

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