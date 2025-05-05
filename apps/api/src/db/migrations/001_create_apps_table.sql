-- Create apps table in public schema
CREATE TABLE IF NOT EXISTS public.apps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  webhook_url TEXT,
  auth_header TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to manage their own apps
CREATE POLICY "Users can manage their own apps"
  ON public.apps
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_apps_updated_at
  BEFORE UPDATE ON public.apps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column(); 