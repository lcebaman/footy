import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface MatchCardProps {
  homeTeam: string;
  awayTeam: string;
  matchTime: string;
  matchId: string;
}

export const MatchCard = ({ homeTeam, awayTeam, matchTime, matchId }: MatchCardProps) => {
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadExistingPrediction();
    }
  }, [user, matchId]);

  const loadExistingPrediction = async () => {
    try {
      const { data, error } = await supabase
        .from('predictions')
        .select('predicted_home_score, predicted_away_score')
        .eq('user_id', user?.id)
        .eq('match_id', matchId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setHomeScore(data.predicted_home_score.toString());
        setAwayScore(data.predicted_away_score.toString());
      }
    } catch (error: any) {
      console.error('Failed to load prediction:', error);
    }
  };

  const handleSubmit = async () => {
    if (homeScore === "" || awayScore === "") {
      toast.error("Please enter both scores");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to submit predictions");
      return;
    }

    const homeScoreNum = parseInt(homeScore);
    const awayScoreNum = parseInt(awayScore);

    // Validate scores
    if (isNaN(homeScoreNum) || isNaN(awayScoreNum)) {
      toast.error('Please enter valid numbers');
      return;
    }

    if (homeScoreNum < 0 || homeScoreNum > 50 || awayScoreNum < 0 || awayScoreNum > 50) {
      toast.error('Scores must be between 0 and 50');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('predictions')
        .upsert({
          user_id: user.id,
          match_id: matchId,
          predicted_home_score: homeScoreNum,
          predicted_away_score: awayScoreNum,
        }, {
          onConflict: 'user_id,match_id'
        });

      if (error) throw error;

      toast.success(`Prediction saved: ${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-card/80 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent" />
          <span className="text-sm font-medium text-muted-foreground">{matchTime}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-6">
        <div className="text-right">
          <h3 className="font-bold text-lg mb-2">{homeTeam}</h3>
          <Input
            type="number"
            placeholder="0"
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            className="text-center text-xl font-bold h-12"
            min="0"
            max="50"
          />
        </div>
        
        <div className="text-2xl font-bold text-muted-foreground px-4">VS</div>
        
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2">{awayTeam}</h3>
          <Input
            type="number"
            placeholder="0"
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            className="text-center text-xl font-bold h-12"
            min="0"
            max="50"
          />
        </div>
      </div>
      
      <Button onClick={handleSubmit} className="w-full" size="lg" disabled={loading}>
        {loading ? 'Saving...' : 'Submit Prediction'}
      </Button>
    </Card>
  );
};
