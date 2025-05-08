import { z } from 'zod';

export const createInvitationSchema = z.object({
  inviterId: z.string().min(1, 'Inviter ID is required'),
  inviteeIdentifier: z.string().min(1, 'Invitee identifier is required'),
  metadata: z.record(z.any()).optional(),
  email: z.object({
    fromName: z.string().min(1, 'From name is required for email'),
    subject: z.string().min(1, 'Email subject is required'),
    content: z.string().min(1, 'Email content is required'),
  }).optional(),
});

export const verifyInvitationSchema = z.object({
  inviteeIdentifier: z.string().min(1, 'Invitee identifier is required'),
  invitationId: z.string().optional(),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export type VerifyInvitationInput = z.infer<typeof verifyInvitationSchema>; 