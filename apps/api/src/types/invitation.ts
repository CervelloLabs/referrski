export interface Invitation {
  id: string;
  appId: string;
  inviterId: string;
  inviteeIdentifier: string; // Could be email, phone, or any unique identifier
  status: 'pending' | 'completed' | 'expired';
  metadata?: Record<string, any>; // Additional data provided by the app
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CreateInvitationRequest {
  inviterId: string;
  inviteeIdentifier: string;
  metadata?: Record<string, any>;
  email?: {
    fromName: string;
    subject: string;
    content: string;
  };
}

export interface VerifyInvitationRequest {
  inviteeIdentifier: string;
  invitationId?: string; // Optional: apps can verify by either id or identifier
}

export interface InvitationResponse {
  success: boolean;
  message?: string;
  data?: {
    invitation: Invitation;
  };
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface InvitationsResponse {
  success: boolean;
  message?: string;
  data?: {
    invitations: Invitation[];
  };
  errors?: Array<{
    field: string;
    message: string;
  }>;
} 