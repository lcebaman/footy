/*
  # Add Knockout Stage Matches
  
  This migration creates the knockout stage bracket structure for the World Cup predictor.
  
  ## Round of 16 Matches (Following FIFA World Cup Bracket Rules)
  
  The R16 matches are set up according to standard World Cup progression:
  - Match 1: Winner Group A vs Runner-up Group B
  - Match 2: Winner Group C vs Runner-up Group D
  - Match 3: Winner Group E vs Runner-up Group F
  - Match 4: Winner Group G vs Runner-up Group H
  - Match 5: Runner-up Group A vs Winner Group B
  - Match 6: Runner-up Group C vs Winner Group D
  - Match 7: Runner-up Group E vs Winner Group F
  - Match 8: Runner-up Group G vs Winner Group H
  
  ## Progression Structure
  
  - Quarter Finals: Winners of R16 matches progress
  - Semi Finals: Winners of QF matches progress
  - Final & 3rd Place: Winners/Losers of SF matches progress
  
  ## Implementation
  
  Teams are represented as placeholders (e.g., "Winner A" or "Runner-up B") until group stages complete.
  The frontend logic will automatically replace these placeholders with actual team names based on standings.
*/

-- Insert Round of 16 matches
INSERT INTO public.matches (home_team, away_team, match_time, status, stage) VALUES
  -- R16 Match 1: Winner A vs Runner-up B
  ('Winner A', 'Runner-up B', now() + interval '10 days', 'upcoming', 'R16'),
  -- R16 Match 2: Winner C vs Runner-up D
  ('Winner C', 'Runner-up D', now() + interval '10 days 3 hours', 'upcoming', 'R16'),
  -- R16 Match 3: Winner E vs Runner-up F
  ('Winner E', 'Runner-up F', now() + interval '10 days 6 hours', 'upcoming', 'R16'),
  -- R16 Match 4: Winner G vs Runner-up H
  ('Winner G', 'Runner-up H', now() + interval '10 days 9 hours', 'upcoming', 'R16'),
  -- R16 Match 5: Runner-up A vs Winner B
  ('Runner-up A', 'Winner B', now() + interval '11 days', 'upcoming', 'R16'),
  -- R16 Match 6: Runner-up C vs Winner D
  ('Runner-up C', 'Winner D', now() + interval '11 days 3 hours', 'upcoming', 'R16'),
  -- R16 Match 7: Runner-up E vs Winner F
  ('Runner-up E', 'Winner F', now() + interval '11 days 6 hours', 'upcoming', 'R16'),
  -- R16 Match 8: Runner-up G vs Winner H
  ('Runner-up G', 'Winner H', now() + interval '11 days 9 hours', 'upcoming', 'R16');

-- Insert Quarter Final matches
INSERT INTO public.matches (home_team, away_team, match_time, status, stage) VALUES
  -- QF Match 1: Winner R16-1 vs Winner R16-2
  ('Winner R16-1', 'Winner R16-2', now() + interval '15 days', 'upcoming', 'QF'),
  -- QF Match 2: Winner R16-5 vs Winner R16-6
  ('Winner R16-5', 'Winner R16-6', now() + interval '15 days 4 hours', 'upcoming', 'QF'),
  -- QF Match 3: Winner R16-3 vs Winner R16-4
  ('Winner R16-3', 'Winner R16-4', now() + interval '16 days', 'upcoming', 'QF'),
  -- QF Match 4: Winner R16-7 vs Winner R16-8
  ('Winner R16-7', 'Winner R16-8', now() + interval '16 days 4 hours', 'upcoming', 'QF');

-- Insert Semi Final matches
INSERT INTO public.matches (home_team, away_team, match_time, status, stage) VALUES
  -- SF Match 1: Winner QF-1 vs Winner QF-2
  ('Winner QF-1', 'Winner QF-2', now() + interval '20 days', 'upcoming', 'SF'),
  -- SF Match 2: Winner QF-3 vs Winner QF-4
  ('Winner QF-3', 'Winner QF-4', now() + interval '21 days', 'upcoming', 'SF');

-- Insert 3rd Place match
INSERT INTO public.matches (home_team, away_team, match_time, status, stage) VALUES
  ('Loser SF-1', 'Loser SF-2', now() + interval '24 days', 'upcoming', '3P');

-- Insert Final match
INSERT INTO public.matches (home_team, away_team, match_time, status, stage) VALUES
  ('Winner SF-1', 'Winner SF-2', now() + interval '25 days', 'upcoming', 'Final');