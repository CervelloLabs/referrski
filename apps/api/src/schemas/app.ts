import { z } from 'zod';

export const appSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  webhookUrl: z.string().url('Must be a valid URL').optional(),
  authHeader: z.string().optional(),
  enableEmailInvites: z.boolean().optional(),
  emailFromName: z.string().optional(),
  emailSubjectTemplate: z.string().optional(),
  emailTemplate: z.string().optional(),
});

export type AppInput = z.infer<typeof appSchema>; 