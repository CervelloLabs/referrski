# ReferrSki React Native SDK

The ReferrSki React Native SDK provides a simple way to implement email-based referral and invitation functionality in your React Native applications.

## Installation

```bash
npm install @referrski/react-native
# or
yarn add @referrski/react-native
# or
pnpm add @referrski/react-native
```

## Configuration

Before using the SDK, you need to configure it with your app ID and the inviter's email address. This should be done once when your app initializes:

```typescript
import { ReferrSki } from '@referrski/react-native';

ReferrSki.configure({
  appId: 'your-app-id',
  inviterEmail: 'inviter@example.com'
});
```

## Usage

### Creating Invitations

To send an email invitation to a potential user:

```typescript
try {
  await ReferrSki.createInvitation('friend@example.com');
  // Invitation email sent successfully
} catch (error) {
  // Handle error
}
```

### Verifying Invitations

To verify if an email address has a valid invitation:

```typescript
try {
  await ReferrSki.verifyInvitation('friend@example.com');
  // Invitation is valid
} catch (error) {
  // Handle invalid or missing invitation
}
```

### Deleting User Data (GDPR Compliance)

To delete all invitations associated with a specific inviter email (requires authentication):

```typescript
try {
  await ReferrSki.deleteInviterData('user@example.com');
  // All invitations from this email have been deleted
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

The SDK includes a pre-built modal component for collecting and sending email invitations:

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
        inviterEmail="current-user@example.com"
        onSuccess={() => {
          console.log('Email invitation sent successfully');
          setVisible(false);
        }}
        style={{
          // Optional: Custom styles
          container: { /* Modal container styles */ },
          input: { /* Email input field styles */ },
          button: { /* Submit button styles */ },
          buttonText: { /* Button text styles */ },
          title: { /* Title text styles */ },
          error: { /* Error message styles */ }
        }}
        texts={{
          // Optional: Custom texts
          title: 'Invite Your Friends',
          placeholder: 'Enter friend\'s email',
          button: 'Send Invitation',
          success: 'Invitation email sent!',
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

## API Reference

### ReferrSki.configure(config)

Configures the SDK with your application settings.

Parameters:
- `config`: ReferrSkiConfiguration
  - `appId`: string - Your ReferrSki application ID
  - `inviterEmail`: string - The email address of the user sending invitations

### ReferrSki.createInvitation(inviteeEmail)

Creates and sends a new email invitation.

Parameters:
- `inviteeEmail`: string - The email address of the person to invite

Returns: Promise<void>

### ReferrSki.verifyInvitation(inviteeEmail)

Verifies if an invitation exists for the specified email address.

Parameters:
- `inviteeEmail`: string - The email address to verify

Returns: Promise<void>

### ReferrSki.deleteInviterData(inviterEmail)

Deletes all invitations associated with a specific inviter email for the current app.
Requires authentication and app access.

Parameters:
- `inviterEmail`: string - The email address whose invitations should be deleted

Returns: Promise<void>

### InviteModal Component

Props:
- `visible`: boolean - Controls the visibility of the modal
- `onClose`: () => void - Callback function when the modal is closed
- `inviterEmail`: string - Email address of the user sending invitations
- `onSuccess?`: () => void - Optional callback when invitation is sent successfully
- `style?`: Object - Optional styles for customizing the modal appearance
- `texts?`: Object - Optional custom texts for the modal 