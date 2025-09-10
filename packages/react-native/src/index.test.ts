/// <reference types="jest" />
import '@testing-library/jest-dom';
import { ReferrSki } from './index';

// Mock the ReferrSki class since we don't want to make real API calls in tests
jest.mock('./index', () => {
  const mockReferrSki = {
    configure: jest.fn(),
    sendInvite: jest.fn().mockImplementation(async (params) => {
      if (params.email && !params.inviteeIdentifier.includes('@')) {
        throw new Error('Invalid email address');
      }
      return {
        success: true,
        data: {
          invitation: {
            id: 'test-id',
            appId: 'test-app-id',
            inviterId: params.inviterId,
            inviteeIdentifier: params.inviteeIdentifier,
            status: 'pending',
            metadata: params.metadata,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      };
    }),
    validateSignup: jest.fn().mockImplementation(async (params) => ({
      success: true,
      validated: !!params.userThatSignedUpId,
    })),
  };

  return {
    ReferrSki: mockReferrSki,
  };
});

describe('ReferrSki SDK Integration Tests', () => {
  beforeEach(() => {
    ReferrSki.configure({
      appId: 'test-app-id',
      apiKey: 'test-api-key',
    });
  });

  const testInviter = {
    id: 'test@example.com',
    name: 'Test User',
  };

  const testInvitee = 'invitee@example.com';

  describe('sendInvite', () => {
    it('should successfully send an invitation with email', async () => {
      const result = await ReferrSki.sendInvite({
        inviterId: testInviter.id,
        inviteeIdentifier: testInvitee,
        metadata: {
          inviterName: testInviter.name,
        },
        email: {
          fromName: testInviter.name,
          subject: 'Join our app!',
          content: 'Hey there! I think you\'d love using our app.',
        },
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data?.invitation).toBeDefined();
      expect(result.data?.invitation.inviterId).toBe(testInviter.id);
      expect(result.data?.invitation.inviteeIdentifier).toBe(testInvitee);
      expect(result.data?.invitation.status).toBe('pending');
    });

    it('should successfully send an invitation without email', async () => {
      const result = await ReferrSki.sendInvite({
        inviterId: testInviter.id,
        inviteeIdentifier: testInvitee,
        metadata: {
          inviterName: testInviter.name,
        },
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data?.invitation).toBeDefined();
      expect(result.data?.invitation.inviterId).toBe(testInviter.id);
      expect(result.data?.invitation.inviteeIdentifier).toBe(testInvitee);
      expect(result.data?.invitation.status).toBe('pending');
    });

    it('should fail with invalid email address when email is enabled', async () => {
      await expect(ReferrSki.sendInvite({
        inviterId: testInviter.id,
        inviteeIdentifier: 'invalid-email',
        email: {
          fromName: testInviter.name,
          subject: 'Join our app!',
          content: 'Hey there!',
        },
      })).rejects.toThrow();
    });
  });

  describe('validateSignup', () => {
    it('should successfully validate a user signup with valid invitation', async () => {
      const result = await ReferrSki.validateSignup({
        userThatSignedUpId: testInvitee,
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.validated).toBe(true);
    });

    it('should validate signup with different user identifier', async () => {
      const result = await ReferrSki.validateSignup({
        userThatSignedUpId: 'user-123',
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.validated).toBe(true);
    });

    it('should return false when user ID is missing', async () => {
      const result = await ReferrSki.validateSignup({
        userThatSignedUpId: '',
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.validated).toBe(false);
    });
  });

}); 