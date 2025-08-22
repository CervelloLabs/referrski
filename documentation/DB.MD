# ReferrSki Database Documentation

## Overview

ReferrSki uses **Supabase** (PostgreSQL) as its primary database. The database is designed around a referral and invitation system with support for multi-tenancy, user authentication, subscriptions, and comprehensive tracking.

## Database Provider

- **Provider**: Supabase (PostgreSQL 15+)
- **Authentication**: Supabase Auth (built-in user management)
- **Security**: Row Level Security (RLS) enabled on all tables
- **Client**: Supabase JavaScript client with service role access

## Schema Overview

The database consists of two main schemas:
- `auth`: Supabase's built-in authentication schema
- `public`: Application-specific tables

## Core Tables

### 1. apps
Stores application configurations for each user.

```sql
CREATE TABLE public.apps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  webhook_url TEXT,
  auth_header TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
```

**Fields:**
- `id`: Unique identifier for the app
- `name`: Human-readable app name (max 100 characters)
- `webhook_url`: Optional URL for webhook notifications
- `auth_header`: Optional authentication header for webhook requests
- `user_id`: Foreign key to the user who owns this app
- `created_at`: Timestamp when app was created
- `updated_at`: Timestamp when app was last modified

**Security:**
- RLS enabled with policy: "Users can manage their own apps"
- Users can only access apps they own

**Triggers:**
- `update_apps_updated_at`: Automatically updates `updated_at` on modifications

---

### 2. invitations
Stores all invitation records and their status.

```sql
CREATE TABLE public.invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id UUID NOT NULL,
  inviter_id TEXT NOT NULL,
  invitee_identifier TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE CASCADE
);
```

**Fields:**
- `id`: Unique identifier for the invitation
- `app_id`: Foreign key to the app this invitation belongs to
- `inviter_id`: Identifier of the person sending the invitation (usually email)
- `invitee_identifier`: Identifier of the person being invited (email)
- `status`: Current invitation status (pending, completed, expired)
- `metadata`: Flexible JSONB field for storing additional invitation data
- `created_at`: Timestamp when invitation was created
- `updated_at`: Timestamp when invitation was last modified
- `completed_at`: Timestamp when invitation was completed (user signed up)

**Indexes:**
- `idx_invitations_app_id`: For app-based queries
- `idx_invitations_inviter_id`: For finding invitations by inviter
- `idx_invitations_invitee_identifier`: For finding invitations by invitee
- `idx_invitations_status`: For filtering by status

**Security:**
- RLS enabled with policy: "Apps can manage their own invitations"
- Users can only access invitations for apps they own

**Triggers:**
- `update_invitations_updated_at`: Automatically updates `updated_at` on modifications
- `track_invite_created_trigger`: Updates user invite usage when invitation is created
- `track_invite_deleted_trigger`: Updates user invite usage when invitation is deleted

---

### 3. users
Extended user profile information beyond Supabase Auth.

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id`: Primary key that references Supabase Auth user ID
- `email`: User's email address (synced from auth.users)
- `role`: User role (user, admin)
- `created_at`: Timestamp when user record was created
- `updated_at`: Timestamp when user record was last modified

**Security:**
- RLS enabled with policies:
  - "Users can view their own data"
  - "Admins can view all data"

**Triggers:**
- `update_users_updated_at`: Automatically updates `updated_at` on modifications
- `on_auth_user_created`: Automatically creates user record when auth user is created

---

### 4. user_invite_usage
Tracks invitation usage for rate limiting and analytics.

```sql
CREATE TABLE public.user_invite_usage (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_invites INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `user_id`: Primary key that references the user
- `total_invites`: Total number of invitations sent by this user
- `updated_at`: Timestamp when usage was last updated

**Security:**
- RLS enabled with policy: "Users can view their own invite usage"

**Usage:**
- Automatically updated via triggers on invitation creation/deletion
- Used for rate limiting and subscription enforcement

---

### 5. pricing_plans
Defines available subscription plans and their limits.

```sql
CREATE TABLE public.pricing_plans (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  invite_limit INTEGER NOT NULL,
  price_monthly INTEGER NOT NULL, -- in cents
  price_yearly INTEGER NOT NULL, -- in cents
  stripe_price_id_monthly VARCHAR(100),
  stripe_price_id_yearly VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id`: Plan identifier (e.g., 'free', 'basic', 'pro', 'business')
- `name`: Human-readable plan name
- `description`: Plan description
- `invite_limit`: Maximum invitations allowed per month
- `price_monthly`: Monthly price in cents
- `price_yearly`: Yearly price in cents
- `stripe_price_id_monthly`: Stripe price ID for monthly billing
- `stripe_price_id_yearly`: Stripe price ID for yearly billing
- `is_active`: Whether the plan is currently available
- `created_at`: Timestamp when plan was created
- `updated_at`: Timestamp when plan was last modified

**Default Plans:**
- **Free**: 100 invites/month, $0
- **Basic**: 1,000 invites/month, $5/month or $50/year
- **Pro**: 10,000 invites/month, $10/month or $100/year
- **Business**: 100,000 invites/month, $30/month or $300/year

**Security:**
- RLS enabled with policy: "Anyone can view active pricing plans"

---

### 6. user_subscriptions
Tracks user subscription status and Stripe integration.

```sql
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id VARCHAR(50) NOT NULL REFERENCES public.pricing_plans(id),
  status VARCHAR(50) NOT NULL,
  stripe_customer_id VARCHAR(100),
  stripe_subscription_id VARCHAR(100),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);
```

**Fields:**
- `id`: Unique identifier for the subscription record
- `user_id`: Foreign key to the user
- `plan_id`: Foreign key to the pricing plan
- `status`: Subscription status (active, canceled, past_due, trialing, etc.)
- `stripe_customer_id`: Stripe customer ID
- `stripe_subscription_id`: Stripe subscription ID
- `current_period_start`: Start of current billing period
- `current_period_end`: End of current billing period
- `cancel_at_period_end`: Whether to cancel at period end
- `created_at`: Timestamp when subscription was created
- `updated_at`: Timestamp when subscription was last modified

**Constraints:**
- One active subscription per user (UNIQUE constraint on user_id)

**Security:**
- RLS enabled with policy: "Users can view their own subscriptions"

---

### 7. admin_logs (Referenced but not fully implemented)
Stores admin action logs for audit trails.

```sql
-- This table is referenced in code but may need to be created
CREATE TABLE public.admin_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  target_email TEXT,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Note**: This table is referenced in the admin routes but may not be fully implemented in migrations.

## Database Functions

### 1. update_updated_at_column()
Automatically updates the `updated_at` timestamp on row modifications.

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';
```

### 2. handle_new_user()
Automatically creates a user record in `public.users` when a new auth user is created.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. track_invite_created()
Updates user invite usage when a new invitation is created.

```sql
CREATE OR REPLACE FUNCTION track_invite_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_invite_usage (user_id, total_invites)
  SELECT a.user_id, 1
  FROM public.apps a
  WHERE a.id = NEW.app_id
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_invites = public.user_invite_usage.total_invites + 1,
    updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 4. track_invite_deleted()
Updates user invite usage when an invitation is deleted.

```sql
CREATE OR REPLACE FUNCTION track_invite_deleted()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.user_invite_usage 
  SET 
    total_invites = GREATEST(0, total_invites - 1),
    updated_at = CURRENT_TIMESTAMP
  FROM public.apps a
  WHERE a.id = OLD.app_id 
  AND public.user_invite_usage.user_id = a.user_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;
```

### 5. get_user_invite_limit()
Returns the invite limit for a user based on their subscription.

```sql
CREATE OR REPLACE FUNCTION get_user_invite_limit(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    plan_limit INTEGER;
BEGIN
  SELECT p.invite_limit INTO plan_limit
  FROM public.user_subscriptions s
  JOIN public.pricing_plans p ON s.plan_id = p.id
  WHERE s.user_id = user_uuid AND s.status = 'active';

  IF plan_limit IS NULL THEN
    SELECT invite_limit INTO plan_limit
    FROM public.pricing_plans WHERE id = 'free';
  END IF;

  RETURN plan_limit;
END;
$$ LANGUAGE plpgsql;
```

## Row Level Security (RLS) Policies

All tables have RLS enabled with specific policies:

### apps Table
- **"Users can manage their own apps"**: Users can only access apps they own
  ```sql
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id)
  ```

### invitations Table
- **"Apps can manage their own invitations"**: Users can only access invitations for their apps
  ```sql
  USING (app_id IN (SELECT id FROM public.apps WHERE user_id = auth.uid()))
  WITH CHECK (app_id IN (SELECT id FROM public.apps WHERE user_id = auth.uid()))
  ```

### users Table
- **"Users can view their own data"**: Users can view their own profile
  ```sql
  USING (auth.uid() = id)
  ```
- **"Admins can view all data"**: Admin users can view all user profiles
  ```sql
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  ```

### user_invite_usage Table
- **"Users can view their own invite usage"**: Users can view their own usage stats
  ```sql
  USING (auth.uid() = user_id)
  ```

### pricing_plans Table
- **"Anyone can view active pricing plans"**: All users can view active plans
  ```sql
  USING (is_active = TRUE)
  ```

### user_subscriptions Table
- **"Users can view their own subscriptions"**: Users can view their own subscription
  ```sql
  USING (auth.uid() = user_id)
  ```

## Database Triggers

### Automatic Timestamp Updates
- `update_apps_updated_at`: Updates `apps.updated_at` on modifications
- `update_invitations_updated_at`: Updates `invitations.updated_at` on modifications
- `update_users_updated_at`: Updates `users.updated_at` on modifications

### User Management
- `on_auth_user_created`: Creates `public.users` record when auth user is created

### Invite Tracking
- `track_invite_created_trigger`: Updates invite usage on invitation creation
- `track_invite_deleted_trigger`: Updates invite usage on invitation deletion

## Indexes

### Performance Optimizations
- `idx_invitations_app_id`: Fast app-based invitation queries
- `idx_invitations_inviter_id`: Fast inviter-based queries
- `idx_invitations_invitee_identifier`: Fast invitee-based queries
- `idx_invitations_status`: Fast status-based filtering

## Connection & Configuration

### Supabase Client Configuration
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});
```

### Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for admin operations
- `SUPABASE_ANON_KEY`: Anonymous key for client-side operations

## Data Validation

### Zod Schemas
The application uses Zod for runtime validation:

#### App Schema
```typescript
const appSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  webhookUrl: z.union([
    z.string().url('Must be a valid URL'),
    z.string().max(0) // Allow empty string
  ]).optional(),
  authHeader: z.string().optional(),
});
```

#### Invitation Schema
```typescript
const createInvitationSchema = z.object({
  inviterId: z.string().min(1, 'Inviter ID is required'),
  inviteeIdentifier: z.string()
    .min(1, 'Invitee identifier is required')
    .refine((val) => emailRegex.test(val), {
      message: 'Invalid email address format',
    }),
  metadata: z.record(z.any()).optional(),
  email: z.object({
    fromName: z.string().min(1, 'From name is required for email'),
    subject: z.string().min(1, 'Email subject is required'),
    content: z.string().min(1, 'Email content is required'),
  }).optional(),
});
```

#### Auth Schema
```typescript
const signUpSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});
```

## Migration History

1. **001_create_apps_table.sql**: Initial apps table with RLS
2. **002_modify_apps_columns.sql**: Made webhook_url and auth_header nullable
3. **003_create_invitations_table.sql**: Invitations table with indexes and RLS
4. **005_add_user_invite_tracking.sql**: User invite usage tracking with triggers
5. **006_create_subscriptions_table.sql**: Pricing plans and subscriptions
6. **007_create_users_table.sql**: Extended user profiles with roles
7. **008_fix_invite_usage_tracking.sql**: Fixed deletion tracking trigger

## Common Queries

### Get User's Apps
```sql
SELECT * FROM public.apps 
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
```

### Get App Invitations
```sql
SELECT * FROM public.invitations 
WHERE app_id = $1 
ORDER BY created_at DESC;
```

### Get User Invite Usage
```sql
SELECT total_invites, updated_at 
FROM public.user_invite_usage 
WHERE user_id = auth.uid();
```

### Get User's Active Subscription
```sql
SELECT s.*, p.name as plan_name, p.invite_limit
FROM public.user_subscriptions s
JOIN public.pricing_plans p ON s.plan_id = p.id
WHERE s.user_id = auth.uid() AND s.status = 'active';
```

### Get Invitation Statistics
```sql
SELECT 
  COUNT(*) as total_invites,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_invites,
  COUNT(DISTINCT invitee_identifier) as unique_invitees
FROM public.invitations 
WHERE app_id = $1;
```

## Best Practices

### Security
1. **Always use RLS**: Every table has appropriate row-level security
2. **Use service role carefully**: Only use service role for admin operations
3. **Validate input**: Use Zod schemas for all user input
4. **Audit trails**: Log important admin actions

### Performance
1. **Use indexes**: Proper indexes on frequently queried columns
2. **Limit result sets**: Always use pagination for large datasets
3. **Use prepared statements**: Prevent SQL injection and improve performance
4. **Monitor slow queries**: Use Supabase's query performance tools

### Data Integrity
1. **Use foreign keys**: Maintain referential integrity
2. **Use constraints**: Enforce business rules at database level
3. **Use triggers**: Automate data consistency (timestamps, counters)
4. **Use transactions**: For operations that modify multiple tables

### Maintenance
1. **Regular backups**: Supabase handles this automatically
2. **Monitor usage**: Track invitation counts and subscription status
3. **Clean old data**: Consider archiving old completed invitations
4. **Update schemas**: Use migrations for all schema changes

---

## Troubleshooting

### Common Issues

1. **RLS blocking queries**: Ensure proper authentication context
2. **Trigger not firing**: Check trigger conditions and permissions
3. **Foreign key violations**: Verify referenced records exist
4. **Performance issues**: Check query plans and index usage

### Debugging Queries

```sql
-- Check RLS context
SELECT auth.uid();

-- Check user permissions
SELECT * FROM public.users WHERE id = auth.uid();

-- Verify app ownership
SELECT * FROM public.apps WHERE user_id = auth.uid();

-- Check invite usage
SELECT * FROM public.user_invite_usage WHERE user_id = auth.uid();
```
