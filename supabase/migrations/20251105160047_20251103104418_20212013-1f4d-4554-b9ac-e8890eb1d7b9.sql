-- Fix 1: Add write protection to matches table
-- Deny all write operations to matches table for regular users
CREATE POLICY "No one can insert matches" 
ON public.matches 
FOR INSERT 
TO authenticated
WITH CHECK (false);

CREATE POLICY "No one can update matches" 
ON public.matches 
FOR UPDATE 
TO authenticated
USING (false);

CREATE POLICY "No one can delete matches" 
ON public.matches 
FOR DELETE 
TO authenticated
USING (false);

-- Fix 2: Restrict profile visibility to authenticated users only
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Fix 3: Add score validation constraints
ALTER TABLE public.predictions 
ADD CONSTRAINT check_valid_home_score 
CHECK (predicted_home_score >= 0 AND predicted_home_score <= 50);

ALTER TABLE public.predictions 
ADD CONSTRAINT check_valid_away_score 
CHECK (predicted_away_score >= 0 AND predicted_away_score <= 50);

-- Also add validation for actual match scores
ALTER TABLE public.matches 
ADD CONSTRAINT check_valid_match_home_score 
CHECK (home_score IS NULL OR (home_score >= 0 AND home_score <= 50));

ALTER TABLE public.matches 
ADD CONSTRAINT check_valid_match_away_score 
CHECK (away_score IS NULL OR (away_score >= 0 AND away_score <= 50));