-- Add app store URL fields to apps table
ALTER TABLE public.apps
ADD COLUMN ios_app_url TEXT,
ADD COLUMN android_app_url TEXT;

-- Add comments for clarity
COMMENT ON COLUMN public.apps.ios_app_url IS 'iOS App Store URL for the app';
COMMENT ON COLUMN public.apps.android_app_url IS 'Google Play Store URL for the app';
