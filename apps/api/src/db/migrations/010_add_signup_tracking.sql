-- Add signup tracking to invitations table
-- This tracks when an invited user actually signs up after accepting the invitation

ALTER TABLE public.invitations 
ADD COLUMN IF NOT EXISTS signed_up_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS signed_up_user_id TEXT;

-- Create index for signup tracking queries
CREATE INDEX IF NOT EXISTS idx_invitations_signed_up_at ON public.invitations(signed_up_at);
CREATE INDEX IF NOT EXISTS idx_invitations_signed_up_user_id ON public.invitations(signed_up_user_id);

-- Create function to get invitation funnel metrics for an app
CREATE OR REPLACE FUNCTION get_invitation_funnel_metrics(app_uuid UUID)
RETURNS TABLE (
    total_invitations BIGINT,
    invitations_accepted BIGINT,
    invitations_signed_up BIGINT,
    acceptance_rate NUMERIC,
    signup_rate NUMERIC,
    conversion_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_invitations,
        COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) as invitations_accepted,
        COUNT(CASE WHEN signed_up_at IS NOT NULL THEN 1 END) as invitations_signed_up,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) * 100.0 / COUNT(*)), 2)
            ELSE 0
        END as acceptance_rate,
        CASE 
            WHEN COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) > 0 THEN 
                ROUND((COUNT(CASE WHEN signed_up_at IS NOT NULL THEN 1 END) * 100.0 / COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END)), 2)
            ELSE 0
        END as signup_rate,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN signed_up_at IS NOT NULL THEN 1 END) * 100.0 / COUNT(*)), 2)
            ELSE 0
        END as conversion_rate
    FROM public.invitations
    WHERE app_id = app_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create function to get detailed invitation metrics with time periods
CREATE OR REPLACE FUNCTION get_invitation_metrics_by_period(
    app_uuid UUID, 
    period_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    total_invitations BIGINT,
    invitations_accepted BIGINT,
    invitations_signed_up BIGINT,
    acceptance_rate NUMERIC,
    signup_rate NUMERIC,
    conversion_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (CURRENT_TIMESTAMP - INTERVAL '1 day' * period_days) as period_start,
        CURRENT_TIMESTAMP as period_end,
        COUNT(*) as total_invitations,
        COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) as invitations_accepted,
        COUNT(CASE WHEN signed_up_at IS NOT NULL THEN 1 END) as invitations_signed_up,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) * 100.0 / COUNT(*)), 2)
            ELSE 0
        END as acceptance_rate,
        CASE 
            WHEN COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) > 0 THEN 
                ROUND((COUNT(CASE WHEN signed_up_at IS NOT NULL THEN 1 END) * 100.0 / COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END)), 2)
            ELSE 0
        END as signup_rate,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN signed_up_at IS NOT NULL THEN 1 END) * 100.0 / COUNT(*)), 2)
            ELSE 0
        END as conversion_rate
    FROM public.invitations
    WHERE app_id = app_uuid
    AND created_at >= (CURRENT_TIMESTAMP - INTERVAL '1 day' * period_days);
END;
$$ LANGUAGE plpgsql;
