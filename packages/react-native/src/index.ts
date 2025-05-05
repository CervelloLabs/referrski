interface ReferrSkiConfiguration {
  appId: string;
  inviterId: string;
}

class ReferrSki {
  private static instance: ReferrSki;
  private appId: string;
  private inviterId: string;
  private readonly apiUrl: string = 'https://api.referrski.com';

  private constructor(config: ReferrSkiConfiguration) {
    this.appId = config.appId;
    this.inviterId = config.inviterId;
  }

  static configure(config: ReferrSkiConfiguration): void {
    ReferrSki.instance = new ReferrSki(config);
  }

  private static getInstance(): ReferrSki {
    if (!ReferrSki.instance) {
      throw new Error('ReferrSki must be configured before use. Call ReferrSki.configure() first.');
    }
    return ReferrSki.instance;
  }

  static async createInvitation(inviteeEmail: string): Promise<void> {
    const instance = ReferrSki.getInstance();
    const response = await fetch(`${instance.apiUrl}/api/apps/${instance.appId}/invitations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inviterId: instance.inviterId,
        inviteeIdentifier: inviteeEmail,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create invitation');
    }
  }

  static async verifyInvitation(inviteeEmail: string): Promise<void> {
    const instance = ReferrSki.getInstance();
    const response = await fetch(`${instance.apiUrl}/api/apps/${instance.appId}/invitations/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inviteeIdentifier: inviteeEmail,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to verify invitation');
    }
  }
}

// Re-export the InviteModal component for convenience
export { InviteModal } from './InviteModal';
export { ReferrSki }; 