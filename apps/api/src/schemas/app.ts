import { z } from 'zod';

export const appSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  webhookUrl: z.union([
    z.string().url('Must be a valid URL'),
    z.string().max(0) // Allow empty string
  ]).optional(),
  authHeader: z.string().optional(),
  enableEmailInvites: z.boolean().optional(),
  emailFromName: z.string().optional(),
  emailSubjectTemplate: z.string().optional(),
  emailTemplate: z.string().optional(),
  iosAppUrl: z.preprocess(
    (val) => val === null || val === '' ? undefined : val,
    z.string().url('Must be a valid URL').optional()
  ),
  androidAppUrl: z.preprocess(
    (val) => val === null || val === '' ? undefined : val,
    z.string().url('Must be a valid URL').optional()
  ),
});

export type AppInput = z.infer<typeof appSchema>; 