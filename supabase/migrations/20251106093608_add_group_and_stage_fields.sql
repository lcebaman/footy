/*
  # Add Group and Stage Fields to Matches

  This migration adds group and stage classification to matches for tournament organization.

  ## Changes
  1. Add `group` column to matches table (A-H for World Cup groups)
  2. Add `stage` column to matches table (Group, R16, QF, SF, 3P, Final)
  3. Add indexes for better query performance
*/

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
