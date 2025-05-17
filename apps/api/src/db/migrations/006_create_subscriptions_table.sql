-- Create pricing_plans table
CREATE TABLE IF NOT EXISTS public.pricing_plans (
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

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) NOT NULL REFERENCES public.pricing_plans(id),
    status VARCHAR(50) NOT NULL, -- 'active', 'canceled', 'past_due', 'trialing', etc.
    stripe_customer_id VARCHAR(100),
    stripe_subscription_id VARCHAR(100),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id) -- One active subscription per user
);

-- Enable RLS for pricing_plans
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

-- Create pricing_plans policy for viewing
CREATE POLICY "Anyone can view active pricing plans"
    ON public.pricing_plans
    FOR SELECT
    USING (is_active = TRUE);

-- Enable RLS for user_subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create user_subscriptions policy for viewing own subscription
CREATE POLICY "Users can view their own subscriptions"
    ON public.user_subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Insert default pricing plans
INSERT INTO public.pricing_plans (id, name, description, invite_limit, price_monthly, price_yearly, is_active)
VALUES 
('free', 'Free', 'Get started with a small number of invites', 100, 0, 0, TRUE),
('basic', 'Basic', '1,000 invites per month', 1000, 500, 5000, TRUE),
('pro', 'Pro', '10,000 invites per month', 10000, 1000, 10000, TRUE),
('business', 'Business', '100,000 invites per month', 100000, 3000, 30000, TRUE);

-- Function to set invite limit for users based on their subscription
CREATE OR REPLACE FUNCTION get_user_invite_limit(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    plan_limit INTEGER;
BEGIN
    -- Get the invite limit from the user's active subscription
    SELECT p.invite_limit INTO plan_limit
    FROM public.user_subscriptions s
    JOIN public.pricing_plans p ON s.plan_id = p.id
    WHERE s.user_id = user_uuid
    AND s.status = 'active';

    -- If no active subscription found, return the free tier limit
    IF plan_limit IS NULL THEN
        SELECT invite_limit INTO plan_limit
        FROM public.pricing_plans
        WHERE id = 'free';
    END IF;

    RETURN plan_limit;
END;
$$ LANGUAGE plpgsql;
