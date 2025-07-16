-- Migration to fix invite usage tracking by adding deletion trigger
-- This fixes the issue where deletions don't decrement the total_invites count

-- Create function to track invite deleted (if it doesn't exist)
CREATE OR REPLACE FUNCTION track_invite_deleted()
RETURNS TRIGGER AS $$
BEGIN
    -- Get the user_id from the apps table using the app_id from the deleted invitation
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

-- Drop trigger if it exists (for idempotency)
DROP TRIGGER IF EXISTS track_invite_deleted_trigger ON public.invitations;

-- Create trigger to track deleted invites
CREATE TRIGGER track_invite_deleted_trigger
    AFTER DELETE ON public.invitations
    FOR EACH ROW
    EXECUTE FUNCTION track_invite_deleted(); 