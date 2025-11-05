-- Add group and stage fields to matches table
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS "group" text,
ADD COLUMN IF NOT EXISTS stage text DEFAULT 'Group';

-- Update existing matches to have Group stage by default
UPDATE public.matches 
SET stage = 'Group' 
WHERE stage IS NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_matches_group ON public.matches("group");
CREATE INDEX IF NOT EXISTS idx_matches_stage ON public.matches(stage);