/*
  # Add World Cup Group Stage Matches

  This migration populates the database with all 48 group stage matches across 8 groups.

  ## Match Structure
  - Groups A through H (6 matches per group)
  - Each group has 4 teams
  - Matches scheduled with realistic timing

  ## Teams by Group
  - Group A: Qatar, Ecuador, Senegal, Netherlands
  - Group B: England, Iran, USA, Wales
  - Group C: Argentina, Saudi Arabia, Mexico, Poland
  - Group D: France, Australia, Denmark, Tunisia
  - Group E: Spain, Costa Rica, Germany, Japan
  - Group F: Belgium, Canada, Morocco, Croatia
  - Group G: Brazil, Serbia, Switzerland, Cameroon
  - Group H: Portugal, Ghana, Uruguay, South Korea
*/

-- Clear existing sample matches first
DELETE FROM public.matches WHERE stage = 'Group' AND "group" IS NULL;

-- Group A Matches
INSERT INTO public.matches (home_team, away_team, match_time, status, stage, "group") VALUES
  ('Qatar', 'Ecuador', now() + interval '1 day', 'upcoming', 'Group', 'A'),
  ('Senegal', 'Netherlands', now() + interval '1 day 6 hours', 'upcoming', 'Group', 'A'),
  ('Qatar', 'Senegal', now() + interval '5 days', 'upcoming', 'Group', 'A'),
  ('Netherlands', 'Ecuador', now() + interval '5 days 6 hours', 'upcoming', 'Group', 'A'),
  ('Netherlands', 'Qatar', now() + interval '9 days', 'upcoming', 'Group', 'A'),
  ('Ecuador', 'Senegal', now() + interval '9 days 6 hours', 'upcoming', 'Group', 'A');

-- Group B Matches
INSERT INTO public.matches (home_team, away_team, match_time, status, stage, "group") VALUES
  ('England', 'Iran', now() + interval '1 day 3 hours', 'upcoming', 'Group', 'B'),
  ('USA', 'Wales', now() + interval '1 day 9 hours', 'upcoming', 'Group', 'B'),
  ('Wales', 'Iran', now() + interval '5 days 3 hours', 'upcoming', 'Group', 'B'),
  ('England', 'USA', now() + interval '5 days 9 hours', 'upcoming', 'Group', 'B'),
  ('Wales', 'England', now() + interval '9 days 3 hours', 'upcoming', 'Group', 'B'),
  ('Iran', 'USA', now() + interval '9 days 9 hours', 'upcoming', 'Group', 'B');

-- Group C Matches
INSERT INTO public.matches (home_team, away_team, match_time, status, stage, "group") VALUES
  ('Argentina', 'Saudi Arabia', now() + interval '2 days', 'upcoming', 'Group', 'C'),
  ('Mexico', 'Poland', now() + interval '2 days 6 hours', 'upcoming', 'Group', 'C'),
  ('Poland', 'Saudi Arabia', now() + interval '6 days', 'upcoming', 'Group', 'C'),
  ('Argentina', 'Mexico', now() + interval '6 days 6 hours', 'upcoming', 'Group', 'C'),
  ('Poland', 'Argentina', now() + interval '10 days', 'upcoming', 'Group', 'C'),
  ('Saudi Arabia', 'Mexico', now() + interval '10 days 6 hours', 'upcoming', 'Group', 'C');

-- Group D Matches
INSERT INTO public.matches (home_team, away_team, match_time, status, stage, "group") VALUES
  ('France', 'Australia', now() + interval '2 days 3 hours', 'upcoming', 'Group', 'D'),
  ('Denmark', 'Tunisia', now() + interval '2 days 9 hours', 'upcoming', 'Group', 'D'),
  ('Tunisia', 'Australia', now() + interval '6 days 3 hours', 'upcoming', 'Group', 'D'),
  ('France', 'Denmark', now() + interval '6 days 9 hours', 'upcoming', 'Group', 'D'),
  ('Tunisia', 'France', now() + interval '10 days 3 hours', 'upcoming', 'Group', 'D'),
  ('Australia', 'Denmark', now() + interval '10 days 9 hours', 'upcoming', 'Group', 'D');

-- Group E Matches
INSERT INTO public.matches (home_team, away_team, match_time, status, stage, "group") VALUES
  ('Spain', 'Costa Rica', now() + interval '3 days', 'upcoming', 'Group', 'E'),
  ('Germany', 'Japan', now() + interval '3 days 6 hours', 'upcoming', 'Group', 'E'),
  ('Japan', 'Costa Rica', now() + interval '7 days', 'upcoming', 'Group', 'E'),
  ('Spain', 'Germany', now() + interval '7 days 6 hours', 'upcoming', 'Group', 'E'),
  ('Japan', 'Spain', now() + interval '11 days', 'upcoming', 'Group', 'E'),
  ('Costa Rica', 'Germany', now() + interval '11 days 6 hours', 'upcoming', 'Group', 'E');

-- Group F Matches
INSERT INTO public.matches (home_team, away_team, match_time, status, stage, "group") VALUES
  ('Belgium', 'Canada', now() + interval '3 days 3 hours', 'upcoming', 'Group', 'F'),
  ('Morocco', 'Croatia', now() + interval '3 days 9 hours', 'upcoming', 'Group', 'F'),
  ('Croatia', 'Canada', now() + interval '7 days 3 hours', 'upcoming', 'Group', 'F'),
  ('Belgium', 'Morocco', now() + interval '7 days 9 hours', 'upcoming', 'Group', 'F'),
  ('Croatia', 'Belgium', now() + interval '11 days 3 hours', 'upcoming', 'Group', 'F'),
  ('Canada', 'Morocco', now() + interval '11 days 9 hours', 'upcoming', 'Group', 'F');

-- Group G Matches
INSERT INTO public.matches (home_team, away_team, match_time, status, stage, "group") VALUES
  ('Brazil', 'Serbia', now() + interval '4 days', 'upcoming', 'Group', 'G'),
  ('Switzerland', 'Cameroon', now() + interval '4 days 6 hours', 'upcoming', 'Group', 'G'),
  ('Cameroon', 'Serbia', now() + interval '8 days', 'upcoming', 'Group', 'G'),
  ('Brazil', 'Switzerland', now() + interval '8 days 6 hours', 'upcoming', 'Group', 'G'),
  ('Cameroon', 'Brazil', now() + interval '12 days', 'upcoming', 'Group', 'G'),
  ('Serbia', 'Switzerland', now() + interval '12 days 6 hours', 'upcoming', 'Group', 'G');

-- Group H Matches
INSERT INTO public.matches (home_team, away_team, match_time, status, stage, "group") VALUES
  ('Portugal', 'Ghana', now() + interval '4 days 3 hours', 'upcoming', 'Group', 'H'),
  ('Uruguay', 'South Korea', now() + interval '4 days 9 hours', 'upcoming', 'Group', 'H'),
  ('South Korea', 'Ghana', now() + interval '8 days 3 hours', 'upcoming', 'Group', 'H'),
  ('Portugal', 'Uruguay', now() + interval '8 days 9 hours', 'upcoming', 'Group', 'H'),
  ('South Korea', 'Portugal', now() + interval '12 days 3 hours', 'upcoming', 'Group', 'H'),
  ('Ghana', 'Uruguay', now() + interval '12 days 9 hours', 'upcoming', 'Group', 'H');
