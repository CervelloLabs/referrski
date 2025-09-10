export interface Invitation {
  id: string;
  appId: string;
  inviterId: string;
  inviteeIdentifier: string;
  status: 'pending' | 'accepted' | 'rejected';
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface InvitationResponse {
  success: boolean;
  data: {
    invitation: Invitation;
  };
}

export interface InvitationsResponse {
  success: boolean;
  data: {
    invitations: Invitation[];
  };
}

export interface SendInviteOptions {
  inviteeIdentifier: string;
  inviterId: string;
  metadata?: Record<string, any>;
  email?: EmailConfig;
}

export interface ReferrSkiConfig {
  appId: string;
}

export interface EmailConfig {
  fromName: string;
  subject: string;
  content: string;
}

export interface ValidateSignupOptions {
  userThatSignedUpId: string;
}

export interface ValidateSignupResponse {
  success: boolean;
  validated: boolean;
  message?: string;
} 