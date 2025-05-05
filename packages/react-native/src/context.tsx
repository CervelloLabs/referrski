import React, { createContext, useContext, useCallback } from 'react';

interface ReferrSkiConfig {
  appId: string;
  inviterId: string;
  apiUrl?: string;
}

interface ReferrSkiContextValue extends ReferrSkiConfig {
  createInvitation: (inviteeEmail: string) => Promise<void>;
  verifyInvitation: (inviteeEmail: string) => Promise<void>;
}

const ReferrSkiContext = createContext<ReferrSkiContextValue | null>(null);

interface ReferrSkiProviderProps extends ReferrSkiConfig {
  children: React.ReactNode;
}

export function ReferrSkiProvider({
  children,
  appId,
  inviterId,
  apiUrl = 'https://api.referrski.com',
}: ReferrSkiProviderProps) {
  const createInvitation = useCallback(async (inviteeEmail: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/apps/${appId}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inviterId,
          inviteeIdentifier: inviteeEmail,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create invitation');
      }
    } catch (error) {
      console.error('Error creating invitation:', error);
      throw error;
    }
  }, [appId, inviterId, apiUrl]);

  const verifyInvitation = useCallback(async (inviteeEmail: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/apps/${appId}/invitations/verify`, {
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
    } catch (error) {
      console.error('Error verifying invitation:', error);
      throw error;
    }
  }, [appId, apiUrl]);

  return (
    <ReferrSkiContext.Provider
      value={{
        appId,
        inviterId,
        apiUrl,
        createInvitation,
        verifyInvitation,
      }}
    >
      {children}
    </ReferrSkiContext.Provider>
  );
}

export function useReferrSki() {
  const context = useContext(ReferrSkiContext);
  if (!context) {
    throw new Error('useReferrSki must be used within a ReferrSkiProvider');
  }
  return context;
} 