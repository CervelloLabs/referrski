-- Create user_invite_usage table
CREATE TABLE IF NOT EXISTS public.user_invite_usage (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_invites INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.user_invite_usage ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own usage
CREATE POLICY "Users can view their own invite usage"
    ON public.user_invite_usage
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create function to track invite usage
CREATE OR REPLACE FUNCTION track_invite_created()
RETURNS TRIGGER AS $$
BEGIN
    -- Get the user_id from the apps table using the app_id from the invitation
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

-- Create trigger to track new invites
CREATE TRIGGER track_invite_created_trigger
    AFTER INSERT ON public.invitations
    FOR EACH ROW
    EXECUTE FUNCTION track_invite_created(); 