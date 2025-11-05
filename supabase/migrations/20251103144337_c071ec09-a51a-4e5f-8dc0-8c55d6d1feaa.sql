-- Fix: Update predictions RLS policy to hide predictions until matches finish
-- This ensures competitive fairness by preventing users from copying others' predictions

DROP POLICY IF EXISTS "Users can view all predictions" ON public.predictions;

CREATE POLICY "Users can view their own and finished match predictions" 
ON public.predictions 
FOR SELECT 
TO authenticated
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM public.matches 
    WHERE matches.id = predictions.match_id 
    AND matches.status = 'finished'
  )
);