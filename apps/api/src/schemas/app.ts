import { z } from 'zod';

export const appSchema = z.object({
  name: z
    .string()
    .min(1, 'App name is required')
    .max(50, 'App name must not exceed 50 characters')
    .regex(/^[a-zA-Z0-9-_ ]+$/, 'App name can only contain letters, numbers, spaces, hyphens, and underscores'),
  webhookUrl: z
    .string()
    .url('Invalid webhook URL')
    .max(500, 'Webhook URL must not exceed 500 characters'),
  authHeader: z
    .string()
    .min(1, 'Auth header is required')
    .max(500, 'Auth header must not exceed 500 characters'),
});

export type AppInput = z.infer<typeof appSchema>; 