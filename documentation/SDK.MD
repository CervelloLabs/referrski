# ReferrSki SDK Documentation

## Overview

ReferrSki provides SDKs for multiple platforms to easily integrate referral and invitation functionality into your applications. This document covers all available SDKs and their usage.

## Available SDKs

### React Native SDK

The ReferrSki React Native SDK provides a simple way to implement referral and invitation functionality in your React Native applications, with optional email-based notifications.

#### Installation

```bash
npm install @referrski/react-native
# or
yarn add @referrski/react-native
# or
pnpm add @referrski/react-native
```

#### Configuration

Before using the SDK, you need to sign up at [www.referrski.com](https://www.referrski.com) to create an account and obtain your app ID and API key.

```typescript
import { ReferrSki } from '@referrski/react-native';

ReferrSki.configure({
  appId: 'your-app-id',
  apiKey: 'your-api-key'
});
```

#### Basic Usage

##### Sending Invitations

```typescript
// Send invitation without email notification
try {
  await ReferrSki.sendInvite({
    inviteeIdentifier: 'friend@example.com',
    inviterId: 'current-user-id',
    metadata: {
      inviterName: 'John Doe',
      source: 'mobile_app',
      campaign: 'spring_2024'
    }
  });
  console.log('Invitation sent successfully');
} catch (error) {
  console.error('Failed to send invitation:', error);
}

// Send invitation with email notification
try {
  await ReferrSki.sendInvite({
    inviteeIdentifier: 'friend@example.com',
    inviterId: 'current-user-id',
    metadata: {
      inviterName: 'John Doe'
    },
    email: {
      fromName: 'John Doe',
      subject: 'Join our amazing app!',
      content: 'Hey there! I think you\'d love using our app. Join us and discover all the amazing features we have to offer!'
    }
  });
  console.log('Invitation sent with email notification');
} catch (error) {
  console.error('Failed to send invitation:', error);
}
```

##### Verifying Signups

Use this during user registration to check if the user has a valid invitation:

```typescript
try {
  const result = await ReferrSki.verifySignup({
    inviteeIdentifier: 'friend@example.com',
    // Optional: provide specific invitation ID if known
    invitationId: 'invitation-uuid'
  });
  
  if (result.verified) {
    console.log('User has a valid invitation - completed referral!');
    // Grant referral rewards to both inviter and invitee
  } else {
    console.log('No valid invitation found');
  }
} catch (error) {
  console.error('Failed to verify signup:', error);
}
```

#### UI Components

##### InviteModal Component

The SDK includes a pre-built modal component for collecting and sending invitations:

```typescript
import React, { useState } from 'react';
import { Button } from 'react-native';
import { InviteModal } from '@referrski/react-native';

function MyComponent() {
  const [showInviteModal, setShowInviteModal] = useState(false);

  return (
    <>
      <Button 
        title="Invite Friends" 
        onPress={() => setShowInviteModal(true)} 
      />

      <InviteModal
        visible={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        inviterId="current-user-id"
        inviterName="John Doe"
        sendEmail={true}
        onSuccess={() => {
          console.log('Invitation sent successfully');
          // Optionally show success message or analytics
        }}
        style={{
          container: {
            backgroundColor: '#ffffff',
            borderRadius: 16,
            padding: 24,
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
          input: {
            borderWidth: 2,
            borderColor: '#e2e8f0',
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
          },
          button: {
            backgroundColor: '#3b82f6',
            borderRadius: 8,
            padding: 16,
          },
          buttonText: {
            color: '#ffffff',
            fontSize: 16,
            fontWeight: '600',
          },
          title: {
            fontSize: 24,
            fontWeight: '700',
            color: '#1f2937',
          },
        }}
        texts={{
          title: 'Invite Your Friends',
          placeholder: 'Enter friend\'s email',
          fromPlaceholder: 'Your name',
          button: 'Send Invitation',
          success: 'Invitation sent successfully!',
          error: 'Failed to send invitation'
        }}
      />
    </>
  );
}
```

#### Advanced Usage

##### Custom Error Handling

```typescript
try {
  await ReferrSki.sendInvite({
    inviteeIdentifier: 'friend@example.com',
    inviterId: 'current-user-id',
    metadata: { source: 'referral_page' }
  });
} catch (error) {
  if (error.message?.includes('invite limit')) {
    // Handle rate limit error
    showAlert('You cannot invite people right now, try again later.');
  } else if (error.message?.includes('unauthorized')) {
    // Handle authentication error
    showAlert('Please log in to send invitations.');
  } else {
    // Handle generic error
    showAlert('Something went wrong, try again later.');
  }
}
```

##### Tracking Invitation Success

```typescript
const handleInviteSuccess = async () => {
  // Track invitation sent event
  Analytics.track('invitation_sent', {
    inviter_id: 'current-user-id',
    method: 'email'
  });

  // Update UI state
  setInvitationCount(prevCount => prevCount + 1);
  
  // Show success message
  showSuccessToast('Invitation sent successfully!');
};
```

#### API Reference

##### ReferrSki Class

###### `ReferrSki.configure(config: ReferrSkiConfig): void`

Configures the SDK with your application settings. Must be called before using other methods.

**Parameters:**
- `config.appId` (string): Your ReferrSki application ID
- `config.apiKey` (string): Your ReferrSki API key

**Example:**
```typescript
ReferrSki.configure({
  appId: 'app-uuid-from-referrski',
  apiKey: 'Bearer your-api-key'
});
```

###### `ReferrSki.sendInvite(options: SendInviteOptions): Promise<InvitationResponse>`

Sends a new invitation, optionally with an email notification.

**Parameters:**
- `options.inviteeIdentifier` (string): The identifier (email) of the person to invite
- `options.inviterId` (string): The identifier of the person sending the invitation
- `options.metadata?` (object): Optional metadata about the invitation
- `options.email?` (EmailConfig): Optional email configuration
  - `fromName` (string): Name to show in the email
  - `subject` (string): Email subject line
  - `content` (string): Email content

**Returns:** Promise resolving to InvitationResponse

**Example:**
```typescript
const response = await ReferrSki.sendInvite({
  inviteeIdentifier: 'friend@example.com',
  inviterId: 'user123',
  metadata: {
    inviterName: 'John Doe',
    source: 'mobile_app'
  },
  email: {
    fromName: 'John Doe',
    subject: 'Join our app!',
    content: 'You\'ve been invited to join our amazing app!'
  }
});
```

###### `ReferrSki.verifySignup(options): Promise<{ success: boolean; verified: boolean }>`

Verifies if an invitation exists for the specified identifier during signup.

**Parameters:**
- `options.inviteeIdentifier` (string): The identifier to verify
- `options.invitationId?` (string): Optional specific invitation ID to verify

**Returns:** Promise resolving to verification result

**Example:**
```typescript
const result = await ReferrSki.verifySignup({
  inviteeIdentifier: 'newuser@example.com'
});

if (result.verified) {
  // User completed a referral
}
```

##### InviteModal Component

A pre-built modal component for collecting and sending invitations.

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `visible` | boolean | ✅ | - | Controls the visibility of the modal |
| `onClose` | () => void | ✅ | - | Callback when the modal is closed |
| `inviterId` | string | ✅ | - | Identifier of the user sending invitations |
| `inviterName` | string | - | - | Name of the user sending invitations |
| `sendEmail` | boolean | - | true | Whether to send email notifications |
| `onSuccess` | () => void | - | - | Callback when invitation is sent successfully |
| `successMessage` | string | - | "Invitation sent successfully!" | Success message to display |
| `style` | object | - | {} | Custom styles for modal components |
| `texts` | object | - | {} | Custom texts for modal elements |

**Style Customization:**

```typescript
interface InviteModalStyles {
  container?: StyleProp<ViewStyle>;        // Modal card container
  overlay?: StyleProp<ViewStyle>;          // Modal overlay background
  modalCard?: StyleProp<ViewStyle>;        // Modal card
  input?: StyleProp<TextStyle>;            // Input fields
  inputContainer?: StyleProp<ViewStyle>;   // Input containers
  button?: StyleProp<ViewStyle>;           // Submit button
  buttonText?: StyleProp<TextStyle>;       // Button text
  title?: StyleProp<TextStyle>;            // Title text
  description?: StyleProp<TextStyle>;      // Description text
  error?: StyleProp<TextStyle>;            // Error messages
  closeButton?: StyleProp<ViewStyle>;      // Close button
  closeButtonText?: StyleProp<TextStyle>;  // Close button text
  successContainer?: StyleProp<ViewStyle>; // Success state container
  successText?: StyleProp<TextStyle>;      // Success message text
  successIcon?: StyleProp<TextStyle>;      // Success checkmark icon
}
```

**Text Customization:**

```typescript
interface InviteModalTexts {
  title?: string;           // Modal title
  placeholder?: string;     // Email input placeholder
  fromPlaceholder?: string; // Name input placeholder
  button?: string;          // Submit button text
  success?: string;         // Success message
  error?: string;           // Error message
}
```

#### Error Handling

The SDK throws errors in the following cases:

1. **Configuration Error**: When methods are called before `ReferrSki.configure()`
   ```typescript
   // Error: "ReferrSki must be configured with appId before use. Call ReferrSki.configure() first."
   ```

2. **API Errors**: When API requests fail
   ```typescript
   // Error: "Failed to create invitation"
   // Error: "Failed to verify signup"
   ```

3. **Rate Limiting**: When invitation limits are exceeded
   ```typescript
   // Error: Contains "invite limit" - user should try again later
   ```

4. **Authentication Errors**: When API key is invalid or missing permissions
   ```typescript
   // Error: "Unauthorized"
   ```

#### Best Practices

1. **Configure Early**: Call `ReferrSki.configure()` in your app's initialization code
2. **Handle Errors Gracefully**: Always wrap SDK calls in try-catch blocks
3. **Provide User Feedback**: Show loading states and success/error messages
4. **Track Analytics**: Monitor invitation success rates and user engagement
5. **Validate Input**: Ensure email addresses are valid before sending invitations
6. **Respect Rate Limits**: Handle rate limiting errors appropriately

#### Integration Examples

##### Basic Referral Flow

```typescript
// 1. User opens invite modal
<InviteModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  inviterId={currentUser.id}
  inviterName={currentUser.name}
  onSuccess={() => {
    // Track successful invitation
    analytics.track('invitation_sent');
    // Update UI
    setInviteCount(prev => prev + 1);
  }}
/>

// 2. During new user registration
const handleSignup = async (email, password) => {
  try {
    // Create user account
    await createUserAccount(email, password);
    
    // Check for referral
    const referralResult = await ReferrSki.verifySignup({
      inviteeIdentifier: email
    });
    
    if (referralResult.verified) {
      // Award referral bonus
      await awardReferralBonus(email);
      showWelcomeMessage('Welcome! You\'ve been referred by a friend.');
    }
  } catch (error) {
    console.error('Signup error:', error);
  }
};
```

##### Advanced Integration with Analytics

```typescript
const sendInviteWithTracking = async (inviteeEmail: string) => {
  try {
    // Track invitation attempt
    analytics.track('invitation_attempt', {
      inviter_id: currentUser.id,
      method: 'email'
    });
    
    const result = await ReferrSki.sendInvite({
      inviteeIdentifier: inviteeEmail,
      inviterId: currentUser.id,
      metadata: {
        inviterName: currentUser.name,
        source: 'referral_screen',
        utm_campaign: 'friend_referral'
      },
      email: {
        fromName: currentUser.name,
        subject: `${currentUser.name} invited you to join ${appName}!`,
        content: `Hi! ${currentUser.name} thinks you'd love ${appName}. Join us today!`
      }
    });
    
    // Track successful invitation
    analytics.track('invitation_sent', {
      inviter_id: currentUser.id,
      invitee_email: inviteeEmail,
      invitation_id: result.data.invitation.id
    });
    
    return result;
  } catch (error) {
    // Track failed invitation
    analytics.track('invitation_failed', {
      inviter_id: currentUser.id,
      error: error.message
    });
    throw error;
  }
};
```

## Coming Soon

### JavaScript/TypeScript SDK
Web SDK for browser-based applications (coming soon)

### iOS Native SDK
Native iOS SDK for Swift/Objective-C applications (coming soon)

### Android Native SDK
Native Android SDK for Kotlin/Java applications (coming soon)

### Flutter SDK
Cross-platform Flutter SDK (coming soon)

---

## Support

For questions, issues, or feature requests:
- Visit our documentation at [docs.referrski.com](https://docs.referrski.com)
- Contact support at [support@referrski.com](mailto:support@referrski.com)
- Check the [API documentation](./api.MD) for server-side integration
