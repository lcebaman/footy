import { useState, useEffect } from "react";
import { FlagName } from "./FlagName";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
}

interface MatchPredictionRowProps {
  match: Match;
  userId: string;
  onPredictionChange?: () => void;
}

export function MatchPredictionRow({ match, userId, onPredictionChange }: MatchPredictionRowProps) {
  const [predHome, setPredHome] = useState("");
  const [predAway, setPredAway] = useState("");
  const [actualHome, setActualHome] = useState("");
  const [actualAway, setActualAway] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingActual, setSavingActual] = useState(false);

  useEffect(() => {
    loadPrediction();
    // Load actual scores
    if (match.home_score !== null) setActualHome(match.home_score.toString());
    if (match.away_score !== null) setActualAway(match.away_score.toString());
  }, [match.id, userId, match.home_score, match.away_score]);

  const loadPrediction = async () => {
    try {
      const { data, error } = await supabase
        .from('predictions')
        .select('predicted_home_score, predicted_away_score')
        .eq('user_id', userId)
        .eq('match_id', match.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setPredHome(data.predicted_home_score.toString());
        setPredAway(data.predicted_away_score.toString());
      }
    } catch (error: any) {
      console.error('Failed to load prediction:', error);
    }
  };

  const savePrediction = async (home: string, away: string) => {
    if (home === '' || away === '') return;

    const homeScore = parseInt(home);
    const awayScore = parseInt(away);

    // Validate scores
    if (isNaN(homeScore) || isNaN(awayScore)) {
      toast.error('Please enter valid numbers');
      return;
    }

    if (homeScore < 0 || homeScore > 50 || awayScore < 0 || awayScore > 50) {
      toast.error('Scores must be between 0 and 50');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('predictions')
        .upsert({
          user_id: userId,
          match_id: match.id,
          predicted_home_score: homeScore,
          predicted_away_score: awayScore,
        }, {
          onConflict: 'user_id,match_id'
        });

      if (error) {
        console.error('Save error:', error);
        throw error;
      }
      toast.success('Prediction saved!');
      onPredictionChange?.();
    } catch (error: any) {
      console.error('Failed to save prediction:', error);
      toast.error(`Failed to save: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleHomeChange = (value: string) => {
    setPredHome(value);
    if (value !== '' && predAway !== '') {
      savePrediction(value, predAway);
    }
  };

  const handleAwayChange = (value: string) => {
    setPredAway(value);
    if (predHome !== '' && value !== '') {
      savePrediction(predHome, value);
    }
  };

  const saveActualScore = async (home: string, away: string) => {
    if (home === '' || away === '') return;

    const homeScore = parseInt(home);
    const awayScore = parseInt(away);

    if (isNaN(homeScore) || isNaN(awayScore)) {
      toast.error('Please enter valid numbers');
      return;
    }

    if (homeScore < 0 || homeScore > 50 || awayScore < 0 || awayScore > 50) {
      toast.error('Scores must be between 0 and 50');
      return;
    }

    setSavingActual(true);
    try {
      const { error } = await supabase
        .from('matches')
        .update({
          home_score: homeScore,
          away_score: awayScore,
          status: 'finished'
        })
        .eq('id', match.id);

      if (error) throw error;
      toast.success('Actual score saved!');
      onPredictionChange?.();
    } catch (error: any) {
      console.error('Failed to save actual score:', error);
      toast.error(`Failed to save: ${error.message}`);
    } finally {
      setSavingActual(false);
    }
  };

  const handleActualHomeChange = (value: string) => {
    setActualHome(value);
    if (value !== '' && actualAway !== '') {
      saveActualScore(value, actualAway);
    }
  };

  const handleActualAwayChange = (value: string) => {
    setActualAway(value);
    if (actualHome !== '' && value !== '') {
      saveActualScore(actualHome, value);
    }
  };

  return (
    <div className="flex items-center gap-2 py-2 border-b last:border-b-0">
      <div className="flex-1 text-right pr-2 font-medium">
        <FlagName name={match.home_team} />
      </div>

      <div className="w-28 grid grid-cols-3 gap-1 items-center">
        <input
          className={`border rounded px-2 py-1 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${saving ? 'bg-yellow-50' : 'bg-background'}`}
          type="number"
          placeholder="H"
          value={predHome}
          onChange={(e) => handleHomeChange(e.target.value)}
          min="0"
          max="50"
          disabled={saving}
        />
        <div className="text-center text-muted-foreground text-sm">vs</div>
        <input
          className={`border rounded px-2 py-1 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${saving ? 'bg-yellow-50' : 'bg-background'}`}
          type="number"
          placeholder="A"
          value={predAway}
          onChange={(e) => handleAwayChange(e.target.value)}
          min="0"
          max="50"
          disabled={saving}
        />
      </div>

      <div className="flex-1 text-left pl-2 font-medium">
        <FlagName name={match.away_team} />
      </div>

      <div className="ml-auto grid grid-cols-3 gap-1 w-28 items-center">
        <span className="text-xs text-muted-foreground text-right">Final</span>
        <input
          className={`border rounded px-2 py-1 text-center text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${savingActual ? 'bg-yellow-50' : 'bg-background'}`}
          type="number"
          placeholder="-"
          value={actualHome}
          onChange={(e) => handleActualHomeChange(e.target.value)}
          min="0"
          max="50"
          disabled={savingActual}
        />
        <input
          className={`border rounded px-2 py-1 text-center text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${savingActual ? 'bg-yellow-50' : 'bg-background'}`}
          type="number"
          placeholder="-"
          value={actualAway}
          onChange={(e) => handleActualAwayChange(e.target.value)}
          min="0"
          max="50"
          disabled={savingActual}
        />
      </div>
    </div>
  );
}
