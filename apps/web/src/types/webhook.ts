export type WebhookEventType = 
  | 'invitation.created'
  | 'invitation.completed';

// Base invitation data fields
interface InvitationBaseData {
  invitationId: string;
  appId: string;
  inviterId: string;
  inviteeIdentifier: string;
  status: 'pending' | 'completed' | 'expired';
  metadata?: Record<string, any>;
  createdAt: string;
}

// Data specific to invitation.created event
interface InvitationCreatedData extends InvitationBaseData {
  // No additional fields for now
}

// Data specific to invitation.completed event
interface InvitationCompletedData extends InvitationBaseData {
  completedAt: string;
}

// Define the payload structures for each event type
export type WebhookPayloadData = {
  'invitation.created': InvitationCreatedData;
  'invitation.completed': InvitationCompletedData;
};

export interface WebhookPayload {
  type: WebhookEventType;
  data: WebhookPayloadData[WebhookEventType];
} 