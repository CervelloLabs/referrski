-- Create invitations table in public schema
CREATE TABLE IF NOT EXISTS public.invitations (
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

-- Create indexes for common queries
CREATE INDEX idx_invitations_app_id ON public.invitations(app_id);
CREATE INDEX idx_invitations_inviter_id ON public.invitations(inviter_id);
CREATE INDEX idx_invitations_invitee_identifier ON public.invitations(invitee_identifier);
CREATE INDEX idx_invitations_status ON public.invitations(status);

-- Enable Row Level Security
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow apps to manage their own invitations
CREATE POLICY "Apps can manage their own invitations"
  ON public.invitations
  FOR ALL
  USING (app_id IN (
    SELECT id FROM public.apps WHERE user_id = auth.uid()
  ))
  WITH CHECK (app_id IN (
    SELECT id FROM public.apps WHERE user_id = auth.uid()
  ));

-- Create updated_at trigger
CREATE TRIGGER update_invitations_updated_at
  BEFORE UPDATE ON public.invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column(); 