-- Add onboarding and writer_dna to writer_profiles
ALTER TABLE writer_profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE writer_profiles ADD COLUMN IF NOT EXISTS writer_dna JSONB DEFAULT '{}'::jsonb;
