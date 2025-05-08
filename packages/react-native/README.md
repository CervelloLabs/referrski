# ReferrSki React Native SDK

The ReferrSki React Native SDK provides a simple way to implement referral and invitation functionality in your React Native applications, with optional email-based notifications.

## Installation

```bash
npm install @referrski/react-native
# or
yarn add @referrski/react-native
# or
pnpm add @referrski/react-native
```

## Configuration

Before using the SDK, you need to configure it with your app ID:

```typescript
import { ReferrSki } from '@referrski/react-native';

ReferrSki.configure({
  appId: 'your-app-id'
});
```

## Usage

### Creating Invitations

You can create invitations with or without email notifications:

```typescript
// Create invitation without email notification
try {
  await ReferrSki.createInvitation({
    inviteeIdentifier: 'friend@example.com',
    inviterId: 'current-user@example.com',
    metadata: {
      inviterName: 'John Doe'
    }
  });
  // Invitation created successfully
} catch (error) {
  // Handle error
}

// Create invitation with email notification
try {
  await ReferrSki.createInvitation({
    inviteeIdentifier: 'friend@example.com',
    inviterId: 'current-user@example.com',
    metadata: {
      inviterName: 'John Doe'
    },
    email: {
      fromName: 'John Doe',
      subject: 'Join our app!',
      content: 'Hey there! I think you\'d love using our app.'
    }
  });
  // Invitation created and email sent successfully
} catch (error) {
  // Handle error
}
```

### Verifying Invitations

To verify if an identifier has a valid invitation:

```typescript
try {
  await ReferrSki.verifyInvitation('friend@example.com');
  // Invitation is valid
} catch (error) {
  // Handle invalid or missing invitation
}
```

### Deleting User Data (GDPR Compliance)

To delete all invitations associated with a specific inviter (requires authentication):

```typescript
try {
  await ReferrSki.deleteInviterData('user@example.com');
  // All invitations from this user have been deleted
} catch (error) {
  if (error.message.includes('Unauthorized')) {
    // Handle authentication error
  } else if (error.message.includes('access denied')) {
    // Handle permission error
  } else {
    // Handle other errors
  }
}
```

Note: The user must be authenticated and have access to the app to delete data. This is typically used when a user requests their data to be deleted for GDPR compliance.

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
        inviterId="current-user@example.com"
        inviterName="John Doe"
        sendEmail={true} // Optional: set to false to disable email notifications
        onSuccess={() => {
          console.log('Invitation created successfully');
          setVisible(false);
        }}
        style={{
          // Optional: Custom styles
          container: { /* Modal container styles */ },
          input: { /* Input field styles */ },
          button: { /* Submit button styles */ },
          buttonText: { /* Button text styles */ },
          title: { /* Title text styles */ },
          error: { /* Error message styles */ }
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
- When the user is not authenticated (for deletion operations)
- When the user doesn't have permission to perform an operation
- When email configuration is provided with an invalid email address

## API Reference

### ReferrSki.configure(config)

Configures the SDK with your application settings.

Parameters:
- `config`: ReferrSkiConfiguration
  - `appId`: string - Your ReferrSki application ID

### ReferrSki.createInvitation(params)

Creates a new invitation, optionally sending an email notification.

Parameters:
- `params`: CreateInvitationParams
  - `inviteeIdentifier`: string - The identifier (e.g., email) of the person to invite
  - `inviterId`: string - The identifier of the person sending the invitation
  - `metadata?`: object - Optional metadata about the invitation
  - `email?`: EmailConfig - Optional email configuration
    - `fromName`: string - Name to show in the email
    - `subject`: string - Email subject line
    - `content`: string - Email content

Returns: Promise<InvitationResponse>

### ReferrSki.verifyInvitation(inviteeIdentifier)

Verifies if an invitation exists for the specified identifier.

Parameters:
- `inviteeIdentifier`: string - The identifier to verify

Returns: Promise<void>

### ReferrSki.deleteInviterData(inviterId)

Deletes all invitations associated with a specific inviter for the current app.
Requires authentication and app access.

Parameters:
- `inviterId`: string - The identifier whose invitations should be deleted

Returns: Promise<void>

### InviteModal Component

Props:
- `visible`: boolean - Controls the visibility of the modal
- `onClose`: () => void - Callback function when the modal is closed
- `inviterId`: string - Identifier of the user sending invitations
- `inviterName`: string - Name of the user sending invitations
- `sendEmail?`: boolean - Whether to send email notifications (default: true)
- `onSuccess?`: () => void - Optional callback when invitation is sent successfully
- `style?`: Object - Optional styles for customizing the modal appearance
- `texts?`: Object - Optional custom texts for the modal 