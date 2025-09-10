# ReferrSki React Native SDK

The ReferrSki React Native SDK provides a simple way to implement referral and invitation functionality in your React Native applications, with optional email-based notifications.

## Getting Started

Before implementing the SDK, please sign up at [www.referrski.com](https://www.referrski.com) to create an account and obtain your app ID and API key.

## Installation

```bash
npm install @referrski/react-native
# or
yarn add @referrski/react-native
# or
pnpm add @referrski/react-native
```

## Configuration

After signing up at [www.referrski.com](https://www.referrski.com), configure the SDK with your app ID and API key (auth header):

```typescript
import { ReferrSki } from '@referrski/react-native';

ReferrSki.configure({
  appId: 'your-app-id',
  apiKey: 'your-api-key'
});
```

## Usage

### Sending Invitations

You can send invitations with or without email notifications:

```typescript
// Send invitation without email notification
try {
  await ReferrSki.sendInvite({
    inviteeIdentifier: 'friend@example.com',
    inviterId: 'current-user-id',
    metadata: {
      inviterName: 'John Doe'
    }
  });
  // Invitation sent successfully
} catch (error) {
  // Handle error
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
      subject: 'Join our app!',
      content: 'Hey there! I think you\'d love using our app.'
    }
  });
  // Invitation sent with email notification
} catch (error) {
  // Handle error
}
```

### Validating User Signups

After a user completes the signup process, validate that they had an invitation:

```typescript
try {
  const result = await ReferrSki.validateSignup({
    inviteeIdentifier: 'friend@example.com',
    userId: 'user-123', // Your app's user ID
    // Optional: provide specific invitation ID if known
    // invitationId: 'invitation-id'
  });
  
  if (result.validated) {
    // User signup was validated against an invitation
    // This will be tracked in your metrics
  } else {
    // No matching invitation found for this signup
  }
} catch (error) {
  // Handle error
}
```

### Deleting User Data (GDPR Compliance)

To delete all invitations associated with a specific inviter:

```typescript
try {
  await ReferrSki.deleteInviterData('user@example.com');
  // All invitations from this user have been deleted
} catch (error) {
  // Handle error
}
```

### Using the InviteModal Component

The SDK includes a pre-built modal component for collecting and sending invitations:

```typescript
import { InviteModal } from '@referrski/react-native';

function MyComponent() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button onPress={() => setVisible(true)}>
        Invite Friends
      </Button>

      <InviteModal
        visible={visible}
        onClose={() => setVisible(false)}
        inviterId="current-user-id"
        inviterName="John Doe"
        sendEmail={true} // Optional: set to false to disable email notifications
        onSuccess={() => {
          console.log('Invitation sent successfully');
        }}
        style={{
          // Optional: Custom styles
          container: { /* Modal card styles */ },
          overlay: { /* Modal overlay styles */ },
          modalCard: { /* Modal card container styles */ },
          input: { /* Input field styles */ },
          inputContainer: { /* Input container styles */ },
          button: { /* Submit button styles */ },
          buttonText: { /* Button text styles */ },
          title: { /* Title text styles */ },
          description: { /* Description text styles */ },
          error: { /* Error message styles */ },
          closeButton: { /* Close button styles */ },
          closeButtonText: { /* Close button text styles */ }
        }}
        texts={{
          // Optional: Custom texts
          title: 'Invite Your Friends',
          placeholder: 'Enter friend\'s email or identifier',
          button: 'Send Invitation',
          success: 'Invitation sent!',
          error: 'Failed to send invitation'
        }}
      />
    </>
  );
}
```

## Error Handling

The SDK throws errors in the following cases:
- When methods are called before configuration
- When API requests fail
- When invitations cannot be created or verified
- When the user doesn't have permission to perform an operation

## API Reference

### ReferrSki.configure(config)

Configures the SDK with your application settings.

Parameters:
- `config`: Object
  - `appId`: string - Your ReferrSki application ID
  - `apiKey`: string - Your ReferrSki API key

### ReferrSki.sendInvite(options)

Sends a new invitation, optionally with an email notification.

Parameters:
- `options`: SendInviteOptions
  - `inviteeIdentifier`: string - The identifier (e.g., email) of the person to invite
  - `inviterId`: string - The identifier of the person sending the invitation
  - `metadata?`: object - Optional metadata about the invitation
  - `email?`: EmailConfig - Optional email configuration
    - `fromName`: string - Name to show in the email
    - `subject`: string - Email subject line
    - `content`: string - Email content

Returns: Promise<InvitationResponse>

### ReferrSki.validateSignup(options)

Validates and records that a user has completed signup after accepting an invitation.

Parameters:
- `options`: ValidateSignupOptions
  - `inviteeIdentifier`: string - The identifier of the user who signed up
  - `userId`: string - The unique user ID from your app's authentication system
  - `invitationId?`: string - Optional specific invitation ID to validate

Returns: Promise<ValidateSignupResponse>

### ReferrSki.deleteInviterData(inviterEmail)

Deletes all invitations associated with a specific inviter for the current app.

Parameters:
- `inviterEmail`: string - The email/identifier whose invitations should be deleted

Returns: Promise<{ success: boolean }>

### InviteModal Component

A pre-built modal component for collecting and sending invitations.

Props:
- `visible`: boolean - Controls the visibility of the modal
- `onClose`: () => void - Callback function when the modal is closed
- `inviterId`: string - Identifier of the user sending invitations
- `inviterName`: string - Name of the user sending invitations
- `sendEmail?`: boolean - Whether to send email notifications (default: true)
- `onSuccess?`: () => void - Optional callback when invitation is sent successfully
- `style?`: Object - Optional styles for customizing the modal appearance
  - `container?`: StyleProp<ViewStyle> - Modal card styles
  - `overlay?`: StyleProp<ViewStyle> - Modal overlay styles
  - `modalCard?`: StyleProp<ViewStyle> - Modal card container styles
  - `input?`: StyleProp<TextStyle> - Input field styles
  - `inputContainer?`: StyleProp<ViewStyle> - Input container styles
  - `button?`: StyleProp<ViewStyle> - Submit button styles
  - `buttonText?`: StyleProp<TextStyle> - Button text styles
  - `title?`: StyleProp<TextStyle> - Title text styles
  - `description?`: StyleProp<TextStyle> - Description text styles
  - `error?`: StyleProp<TextStyle> - Error message styles
  - `closeButton?`: StyleProp<ViewStyle> - Close button styles
  - `closeButtonText?`: StyleProp<TextStyle> - Close button text styles
- `texts?`: Object - Optional custom texts for the modal
  - `title?`: string - Modal title
  - `placeholder?`: string - Input placeholder
  - `button?`: string - Button text
  - `success?`: string - Success message
  - `error?`: string - Error message 