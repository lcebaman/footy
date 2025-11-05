-- Allow authenticated users to update match scores
DROP POLICY IF EXISTS "No one can update matches" ON public.matches;

CREATE POLICY "Authenticated users can update match scores"
ON public.matches
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);