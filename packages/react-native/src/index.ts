import type { ReferrSkiConfig, SendInviteOptions, InvitationResponse, InvitationsResponse } from './types';

export class ReferrSki {
  private static instance: ReferrSki | null = null;
  private readonly appId: string;
  private readonly apiUrl: string = process.env.REFERRSKI_API_URL || 'https://api.referrski.com';

  private constructor(appId: string) {
    this.appId = appId;
    this.apiUrl = 'https://api.referrski.com';
  }

  public static configure(config: { appId: string }): void {
    if (!ReferrSki.instance) {
      ReferrSki.instance = new ReferrSki(config.appId);
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
    const response = await fetch(`${instance.apiUrl}/apps/${instance.appId}/invitations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error('Failed to create invitation');
    }

    return response.json();
  }

  public static async getInvitations(): Promise<InvitationsResponse> {
    const instance = ReferrSki.getInstance();
    const response = await fetch(`${instance.apiUrl}/apps/${instance.appId}/invitations`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch invitations');
    }

    return response.json();
  }

  public static async deleteInviterData(inviterEmail: string): Promise<{ success: boolean }> {
    const instance = ReferrSki.getInstance();
    const response = await fetch(
      `${instance.apiUrl}/apps/${instance.appId}/inviters/${encodeURIComponent(inviterEmail)}`,
      {
        method: 'DELETE',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete inviter data');
    }

    return { success: true };
  }
}

// Re-export the InviteModal component for convenience
export { InviteModal } from './InviteModal'; 