import { z } from 'zod';

export const createInvitationSchema = z.object({
  inviterId: z.string().min(1, 'Inviter ID is required'),
  inviteeIdentifier: z.string().min(1, 'Invitee identifier is required'),
  metadata: z.record(z.any()).optional(),
});

export const verifyInvitationSchema = z.object({
  inviteeIdentifier: z.string().min(1, 'Invitee identifier is required'),
  invitationId: z.string().optional(),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export type VerifyInvitationInput = z.infer<typeof verifyInvitationSchema>; 