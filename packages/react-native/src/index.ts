import type { SendInviteOptions, InvitationResponse, ValidateSignupOptions, ValidateSignupResponse } from './types';

export class ReferrSki {
  private static instance: ReferrSki | null = null;
  private readonly appId: string;
  private readonly apiUrl: string = process.env.REFERRSKI_API_URL || 'https://api.referrski.com';
  private readonly apiKey: string;

  private constructor(appId: string, apiKey: string) {
    this.appId = appId;
    this.apiUrl = 'https://api.referrski.com';
    this.apiKey = apiKey;
  }

  public static configure(config: { appId: string, apiKey: string }): void {
    if (!ReferrSki.instance) {
      ReferrSki.instance = new ReferrSki(config.appId, config.apiKey);
    }
  }

  private static getInstance(): ReferrSki {
    if (!ReferrSki.instance) {
      throw new Error('ReferrSki must be configured with appId before use. Call ReferrSki.configure() first.');
    }
    return ReferrSki.instance;
  }

  public static async sendInvite(options: SendInviteOptions): Promise<InvitationResponse> {
    const instance = ReferrSki.getInstance();
    const response = await fetch(`${instance.apiUrl}/api/apps/${instance.appId}/invitations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${instance.apiKey}`,
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      console.error('Failed to create invitation', response.status, response.statusText);
      throw new Error('Failed to create invitation');
    }

    return response.json();
  }

  public static async validateSignup(options: ValidateSignupOptions): Promise<ValidateSignupResponse> {
    const instance = ReferrSki.getInstance();
    const response = await fetch(`${instance.apiUrl}/api/apps/${instance.appId}/invitations/validate-signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${instance.apiKey}`,
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error('Failed to validate signup');
    }

    return response.json();
  }
}

// Re-export the InviteModal component for convenience
export { InviteModal } from './InviteModal'; 