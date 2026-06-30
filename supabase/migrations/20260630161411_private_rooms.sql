ALTER TABLE rooms ADD COLUMN IF NOT EXISTS invite_code text unique;
