# ReferrSki API Documentation

## Overview

ReferrSki is a referral system API that allows users to create apps, send invitations, and track referral completions through webhooks. This document covers all available API endpoints.

## Base URL
- Production: `https://api.referrski.com`
- Development: `http://localhost:3005`

## Authentication

Most endpoints require authentication using a session token set as an HTTP-only cookie. Use the authentication endpoints to obtain a session.

## API Endpoints

### Health Check

#### GET `/api/health`
Check if the API is running.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### Authentication

#### POST `/api/auth/signin`
Sign in with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com"
    },
    "session": {
      "access_token": "token",
      "refresh_token": "refresh_token"
    }
  }
}
```

#### POST `/api/auth/signup`
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Please check your email for verification link",
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com"
    },
    "session": {
      "access_token": "token",
      "refresh_token": "refresh_token"
    }
  }
}
```

#### POST `/api/auth/signout`
Sign out the current user.

**Response:**
```json
{
  "success": true,
  "message": "Signed out successfully"
}
```

#### POST `/api/auth/callback`
Handle authentication callback (used after email verification).

**Request Body:**
```json
{
  "access_token": "token",
  "refresh_token": "refresh_token",
  "type": "signup"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com"
    },
    "session": {
      "access_token": "token",
      "refresh_token": "refresh_token"
    }
  }
}
```

---

### Apps Management

#### GET `/api/apps`
List all apps for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": {
    "apps": [
      {
        "id": "app-uuid",
        "name": "My App",
        "webhookUrl": "https://myapp.com/webhook",
        "authHeader": "Bearer token",
        "userId": "user-uuid",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### POST `/api/apps`
Create a new app.

**Request Body:**
```json
{
  "name": "My App",
  "webhookUrl": "https://myapp.com/webhook",
  "authHeader": "Bearer my-secret-token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "app": {
      "id": "app-uuid",
      "name": "My App",
      "webhookUrl": "https://myapp.com/webhook",
      "authHeader": "Bearer my-secret-token",
      "userId": "user-uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### GET `/api/apps/{id}`
Get details of a specific app.

**Response:**
```json
{
  "success": true,
  "data": {
    "app": {
      "id": "app-uuid",
      "name": "My App",
      "webhookUrl": "https://myapp.com/webhook",
      "authHeader": "Bearer token",
      "userId": "user-uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### PUT `/api/apps/{id}`
Update an existing app.

**Request Body:**
```json
{
  "name": "Updated App Name",
  "webhookUrl": "https://myapp.com/new-webhook",
  "authHeader": "Bearer new-token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "app": {
      "id": "app-uuid",
      "name": "Updated App Name",
      "webhookUrl": "https://myapp.com/new-webhook",
      "authHeader": "Bearer new-token",
      "userId": "user-uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

---

### App Statistics

#### GET `/api/apps/{id}/stats`
Get statistics for a specific app.

**Response:**
```json
{
  "success": true,
  "data": {
    "uniqueInvites": 150,
    "completedInvites": 45
  }
}
```

---

### Invitations

#### GET `/api/apps/{id}/invitations`
List all invitations for a specific app.

**Response:**
```json
{
  "success": true,
  "data": {
    "invitations": [
      {
        "id": "invitation-uuid",
        "appId": "app-uuid",
        "inviterId": "inviter@example.com",
        "inviteeIdentifier": "invitee@example.com",
        "status": "pending",
        "metadata": {},
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "completedAt": null
      }
    ]
  }
}
```

#### POST `/api/apps/{id}/invitations`
Create a new invitation for an app.

**Authentication:** Uses mobile auth verification (API key or token in headers)

**Request Body:**
```json
{
  "inviterId": "inviter@example.com",
  "inviteeIdentifier": "invitee@example.com",
  "metadata": {
    "source": "mobile_app",
    "campaign": "spring_2024"
  },
  "email": {
    "fromName": "John Doe",
    "subject": "You're invited to join!",
    "content": "Join our amazing platform!"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "invitation": {
      "id": "invitation-uuid",
      "appId": "app-uuid",
      "inviterId": "inviter@example.com",
      "inviteeIdentifier": "invitee@example.com",
      "status": "pending",
      "metadata": {
        "source": "mobile_app",
        "campaign": "spring_2024"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "completedAt": null
    }
  }
}
```

#### POST `/api/apps/{id}/invitations/validate-signup`
Validate and record that a user has completed signup after accepting an invitation.

**Authentication:** Uses mobile auth verification (API key or token in headers)

**Request Body:**
```json
{
  "inviteeIdentifier": "invitee@example.com",
  "userId": "user-123",
  "invitationId": "invitation-uuid"  // optional
}
```

**Response:**
```json
{
  "success": true,
  "validated": true,
  "message": "User signup validated successfully",
  "data": {
    "invitation": {
      "id": "invitation-uuid",
      "appId": "app-uuid",
      "inviterId": "inviter@example.com",
      "inviteeIdentifier": "invitee@example.com",
      "status": "completed",
      "metadata": {},
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z",
      "completedAt": "2024-01-01T12:00:00.000Z",
      "signedUpAt": "2024-01-01T12:30:00.000Z",
      "signedUpUserId": "user-123"
    }
  }
}
```

#### GET `/api/apps/{id}/metrics`
Get invitation funnel metrics for an app.

**Authentication:** Uses web auth verification (requires user to own the app)

**Query Parameters:**
- `period` (optional): Number of days for period-specific metrics (default: 30)

**Response:**
```json
{
  "success": true,
  "data": {
    "app": {
      "id": "app-uuid",
      "name": "My App"
    },
    "overall": {
      "total_invitations": 1000,
      "invitations_accepted": 650,
      "invitations_signed_up": 420,
      "acceptance_rate": 65.00,
      "signup_rate": 64.62,
      "conversion_rate": 42.00
    },
    "period": {
      "days": 30,
      "total_invitations": 100,
      "invitations_accepted": 68,
      "invitations_signed_up": 45,
      "acceptance_rate": 68.00,
      "signup_rate": 66.18,
      "conversion_rate": 45.00
    },
    "daily_breakdown": [
      {
        "date": "2024-01-01",
        "total_invitations": 5,
        "invitations_accepted": 3,
        "invitations_signed_up": 2,
        "acceptance_rate": 60.00,
        "signup_rate": 66.67,
        "conversion_rate": 40.00
      }
    ]
  }
}
```

---

### Inviter Management

#### DELETE `/api/apps/{id}/inviters/{email}`
Delete all invitations from a specific inviter for an app.

**Authentication:** Uses mobile auth verification

**Response:**
```json
{
  "success": true
}
```

#### DELETE `/api/admin/inviters/{email}`
Admin endpoint to delete all invitations from a specific inviter across all user's apps.

**Response:**
```json
{
  "success": true
}
```

---

### Invite Usage Tracking

#### GET `/api/invite-usage`
Get current invite usage for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalInvites": 5,
    "remainingInvites": 5,
    "limit": 10,
    "lastUpdated": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Webhook Testing

#### POST `/api/apps/{id}/webhooks/test`
Test webhook delivery for an app.

**Request Body:**
```json
{
  "type": "create",
  "inviterId": "test@example.com",
  "inviteeIdentifier": "invited@example.com",
  "metadata": {
    "test": true
  }
}
```

OR

```json
{
  "type": "verify",
  "inviteeIdentifier": "invited@example.com",
  "invitationId": "invitation-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test create invitation webhook sent",
  "data": {
    "payload": {
      "type": "invitation.created",
      "data": {
        "invitationId": "test-uuid",
        "appId": "app-uuid",
        "inviterId": "test@example.com",
        "inviteeIdentifier": "invited@example.com",
        "status": "pending",
        "metadata": {
          "test": true
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    },
    "webhookResponse": {
      "status": 200,
      "body": "OK"
    }
  }
}
```

---

## Webhook Events

When you configure a webhook URL for your app, ReferrSki will send HTTP POST requests to that URL for the following events:

### invitation.created
Triggered when a new invitation is created.

```json
{
  "type": "invitation.created",
  "data": {
    "invitationId": "invitation-uuid",
    "appId": "app-uuid",
    "inviterId": "inviter@example.com",
    "inviteeIdentifier": "invitee@example.com",
    "status": "pending",
    "metadata": {},
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### invitation.completed
Triggered when an invitation is marked as completed (user signed up).

```json
{
  "type": "invitation.completed",
  "data": {
    "invitationId": "invitation-uuid",
    "appId": "app-uuid",
    "inviterId": "inviter@example.com",
    "inviteeIdentifier": "invitee@example.com",
    "status": "completed",
    "metadata": {},
    "createdAt": "2024-01-01T00:00:00.000Z",
    "completedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Some endpoints have rate limiting:
- Admin endpoints: 5 requests per minute per session, 10 per minute per IP

---

## Mobile App Integration

For mobile app integration, use:
1. Create invitations via `POST /api/apps/{id}/invitations` with mobile auth
2. Validate user signups via `POST /api/apps/{id}/invitations/validate-signup` with mobile auth
3. Listen for webhook events on your server to track referral completions

The mobile auth verification requires proper API keys or tokens configured for your app.
