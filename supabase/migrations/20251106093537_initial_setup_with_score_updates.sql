/*
  # Initial Database Setup with Score Update Capability

  This migration sets up the core database structure for the World Cup Score Predictor.

  ## Tables Created
  1. `profiles` - User profile information
     - `id` (uuid, primary key) - References auth.users
     - `username` (text, unique) - Display name for the user
     - `created_at` (timestamptz) - Account creation timestamp

  2. `matches` - World Cup match information
     - `id` (uuid, primary key) - Unique match identifier
     - `home_team` (text) - Home team name
     - `away_team` (text) - Away team name
     - `match_time` (timestamptz) - Scheduled match time
     - `home_score` (integer) - Actual home team score
     - `away_score` (integer) - Actual away team score
     - `status` (text) - Match status: 'upcoming', 'live', or 'finished'
     - `created_at` (timestamptz) - Record creation timestamp

  3. `predictions` - User predictions for matches
     - `id` (uuid, primary key) - Unique prediction identifier
     - `user_id` (uuid) - References profiles table
     - `match_id` (uuid) - References matches table
     - `predicted_home_score` (integer) - User's predicted home score
     - `predicted_away_score` (integer) - User's predicted away score
     - `points` (integer) - Points earned from this prediction
     - `created_at` (timestamptz) - Prediction creation time
     - `updated_at` (timestamptz) - Last update time

  ## Security (RLS Policies)
  - All tables have RLS enabled
  - Profiles: Everyone can view, users can manage their own
  - Matches: Everyone can view, authenticated users can update scores
  - Predictions: Everyone can view, users can manage their own

  ## Triggers
  - Auto-create profile on user signup
  - Auto-calculate points when match finishes
  - Auto-update timestamps on prediction changes

  ## Sample Data
  - Inserts 6 sample World Cup matches
*/

-- Create profiles table for user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create matches table for World Cup matches
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  match_time TIMESTAMPTZ NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'finished')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Matches policies (public read, authenticated users can update scores)
CREATE POLICY "Matches are viewable by everyone"
  ON public.matches FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can update match scores"
  ON public.matches FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create predictions table
CREATE TABLE IF NOT EXISTS public.predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  predicted_home_score INTEGER NOT NULL CHECK (predicted_home_score >= 0 AND predicted_home_score <= 50),
  predicted_away_score INTEGER NOT NULL CHECK (predicted_away_score >= 0 AND predicted_away_score <= 50),
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, match_id)
);

-- Enable RLS
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- Predictions policies
CREATE POLICY "Users can view all predictions"
  ON public.predictions FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own predictions"
  ON public.predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own predictions"
  ON public.predictions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own predictions"
  ON public.predictions FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to calculate points when match finishes
CREATE OR REPLACE FUNCTION public.calculate_prediction_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prediction RECORD;
  calculated_points INTEGER;
BEGIN
  -- Only calculate if match is finished and has scores
  IF NEW.status = 'finished' AND NEW.home_score IS NOT NULL AND NEW.away_score IS NOT NULL THEN
    -- Update points for all predictions for this match
    FOR prediction IN 
      SELECT * FROM public.predictions WHERE match_id = NEW.id
    LOOP
      calculated_points := 0;
      
      -- Exact score: 10 points
      IF prediction.predicted_home_score = NEW.home_score AND 
         prediction.predicted_away_score = NEW.away_score THEN
        calculated_points := 10;
      -- Correct goal difference: 5 points
      ELSIF (prediction.predicted_home_score - prediction.predicted_away_score) = 
            (NEW.home_score - NEW.away_score) THEN
        calculated_points := 5;
      -- Correct winner: 3 points
      ELSIF (prediction.predicted_home_score > prediction.predicted_away_score AND NEW.home_score > NEW.away_score) OR
            (prediction.predicted_home_score < prediction.predicted_away_score AND NEW.home_score < NEW.away_score) OR
            (prediction.predicted_home_score = prediction.predicted_away_score AND NEW.home_score = NEW.away_score) THEN
        calculated_points := 3;
      END IF;
      
      UPDATE public.predictions 
      SET points = calculated_points 
      WHERE id = prediction.id;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER calculate_points_on_match_finish
  AFTER UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_prediction_points();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_predictions_updated_at
  BEFORE UPDATE ON public.predictions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some World Cup sample matches
INSERT INTO public.matches (home_team, away_team, match_time, status) VALUES
  ('Brazil', 'Argentina', now() + interval '2 hours', 'upcoming'),
  ('France', 'Germany', now() + interval '5 hours', 'upcoming'),
  ('Spain', 'Portugal', now() + interval '1 day', 'upcoming'),
  ('England', 'Italy', now() + interval '1 day 3 hours', 'upcoming'),
  ('Netherlands', 'Belgium', now() + interval '2 days', 'upcoming'),
  ('Croatia', 'Morocco', now() + interval '2 days 4 hours', 'upcoming');
