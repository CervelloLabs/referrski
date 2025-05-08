interface ReferrSkiConfiguration {
  appId: string;
  inviterEmail: string;
}

class ReferrSki {
  private static instance: ReferrSki;
  private appId: string;
  private inviterEmail: string;
  private readonly apiUrl: string = 'https://api.referrski.com';

  private constructor(config: ReferrSkiConfiguration) {
    this.appId = config.appId;
    this.inviterEmail = config.inviterEmail;
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
        inviterEmail: instance.inviterEmail,
        inviteeEmail,
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
        inviteeEmail,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to verify invitation');
    }
  }

  /**
   * Deletes all invitations associated with a specific inviter email for the current app.
   * This is useful for GDPR compliance when users request their data to be deleted.
   * Note: The user must be authenticated and have access to the app to perform this operation.
   * 
   * @param inviterEmail - The email address whose invitations should be deleted
   * @throws Error if the deletion fails, if ReferrSki is not configured, or if the user is not authorized
   */
  static async deleteInviterData(inviterEmail: string): Promise<void> {
    const instance = ReferrSki.getInstance();
    const response = await fetch(
      `${instance.apiUrl}/api/apps/${instance.appId}/inviters/${encodeURIComponent(inviterEmail)}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: Include cookies for authentication
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. User must be authenticated to delete data.');
      } else if (response.status === 404) {
        throw new Error('App not found or access denied.');
      } else {
        throw new Error('Failed to delete inviter data');
      }
    }
  }
}

// Re-export the InviteModal component for convenience
export { InviteModal } from './InviteModal';
export { ReferrSki }; 