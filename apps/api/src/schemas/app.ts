import { z } from 'zod';

export const appSchema = z.object({
  name: z.string().min(1, 'App name is required').max(100, 'App name is too long'),
  webhookUrl: z.string().url('Invalid webhook URL').nullable(),
  authHeader: z.string().nullable(),
});

export type AppInput = z.infer<typeof appSchema>; 