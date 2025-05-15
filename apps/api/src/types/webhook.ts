export type WebhookEventType = 
  | 'invitation.created'
  | 'invitation.completed';

export interface WebhookPayload {
  type: WebhookEventType;
  data: Record<string, any>;
} 