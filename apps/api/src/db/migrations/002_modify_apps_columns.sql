-- Make webhook_url and auth_header explicitly nullable
ALTER TABLE public.apps
ALTER COLUMN webhook_url DROP NOT NULL,
ALTER COLUMN auth_header DROP NOT NULL; 