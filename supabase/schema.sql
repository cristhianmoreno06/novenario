-- Database schema for Novenario Application
-- Execute this script in the SQL Editor of your Supabase project.

-- 1. Create the 'reuniones' table
CREATE TABLE IF NOT EXISTS public.reuniones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    meet_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.reuniones ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Allow anyone (public/anon) to read meeting details
CREATE POLICY "Permitir consulta publica de reuniones" ON public.reuniones
    FOR SELECT
    TO anon
    USING (true);

-- Note: Since no other policies are defined, INSERT, UPDATE, and DELETE operations 
-- from the client-side (anon role) are blocked by default. Only admin/service_role can modify.

-- 4. Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_reuniones_updated_at
    BEFORE UPDATE ON public.reuniones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Mock / Test Data
-- Insert a test meeting for today (to test the active meeting view)
-- Make sure to change 'meet_url' to a valid Google Meet link
INSERT INTO public.reuniones (titulo, fecha, hora, meet_url)
VALUES (
    'Primer día de novenario',
    CURRENT_DATE,
    '18:00:00',
    'https://meet.google.com/abc-defg-hij'
) ON CONFLICT DO NOTHING;
