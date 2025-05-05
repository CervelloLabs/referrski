# ReferrSki React Native SDK

The ReferrSki React Native SDK provides a simple way to implement referral and invitation functionality in your React Native applications.

## Installation

```bash
npm install @referrski/react-native
# or
yarn add @referrski/react-native
# or
pnpm add @referrski/react-native
```

## Configuration

Before using the SDK, you need to configure it with your app ID and inviter ID. This should be done once when your app initializes:

```typescript
import { ReferrSki } from '@referrski/react-native';

ReferrSki.configure({
  appId: 'your-app-id',
  inviterId: 'user-id'
});
```

## Usage

### Creating Invitations

To create an invitation for a new user:

```typescript
try {
  await ReferrSki.createInvitation('invitee@example.com');
  // Invitation sent successfully
} catch (error) {
  // Handle error
}
```

### Verifying Invitations

To verify if a user has a valid invitation:

```typescript
try {
  await ReferrSki.verifyInvitation('invitee@example.com');
  // Invitation is valid
} catch (error) {
  // Handle invalid or missing invitation
}
```

### Using the InviteModal Component

The SDK includes a pre-built InviteModal component for a quick implementation:

```typescript
import { InviteModal } from '@referrski/react-native';

function MyComponent() {
  return (
    <InviteModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
    />
  );
}
```

## Error Handling

The SDK throws errors in the following cases:
- When methods are called before configuration
- When API requests fail
- When invitations cannot be created or verified

Example error handling:

```typescript
try {
  await ReferrSki.createInvitation('invitee@example.com');
} catch (error) {
  if (error.message === 'ReferrSki must be configured before use') {
    // Handle configuration error
  } else {
    // Handle other errors
  }
}
```

## API Reference

### ReferrSki.configure(config)

Configures the SDK with your application settings.

Parameters:
- `config`: ReferrSkiConfiguration
  - `appId`: string - Your ReferrSki application ID
  - `inviterId`: string - The ID of the user sending invitations

### ReferrSki.createInvitation(inviteeEmail)

Creates a new invitation for the specified email address.

Parameters:
- `inviteeEmail`: string - The email address of the invitee

Returns: Promise<void>

### ReferrSki.verifyInvitation(inviteeEmail)

Verifies if an invitation exists for the specified email address.

Parameters:
- `inviteeEmail`: string - The email address to verify

Returns: Promise<void>

### InviteModal Component

Props:
- `isOpen`: boolean - Controls the visibility of the modal
- `onClose`: () => void - Callback function when the modal is closed 