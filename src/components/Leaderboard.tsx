import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LeaderboardEntry {
  username: string;
  total_points: number;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="w-6 h-6 text-accent" />;
    case 2:
      return <Medal className="w-6 h-6 text-muted-foreground" />;
    case 3:
      return <Award className="w-6 h-6 text-muted-foreground" />;
    default:
      return <span className="w-6 h-6 flex items-center justify-center font-bold text-muted-foreground">{rank}</span>;
  }
};

export const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('predictions')
        .select(`
          points,
          profiles!inner(username)
        `)
        .order('points', { ascending: false });

      if (error) throw error;

      // Aggregate points by user
      const userPoints = new Map<string, number>();
      data?.forEach((pred: any) => {
        const username = pred.profiles.username;
        const points = pred.points || 0;
        userPoints.set(username, (userPoints.get(username) || 0) + points);
      });

      // Convert to array and sort
      const leaderboardData = Array.from(userPoints.entries())
        .map(([username, total_points]) => ({ username, total_points }))
        .sort((a, b) => b.total_points - a.total_points)
        .slice(0, 10);

      setLeaderboard(leaderboardData);
    } catch (error: any) {
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-card to-card/80 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold">Leaderboard</h2>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-card/80 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-6 h-6 text-accent" />
        <h2 className="text-2xl font-bold">Leaderboard</h2>
      </div>
      
      <div className="space-y-3">
        {leaderboard.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No predictions yet. Be the first to predict!
          </p>
        ) : (
          leaderboard.map((entry, index) => (
            <div
              key={entry.username}
              className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-4">
                {getRankIcon(index + 1)}
                <div>
                  <p className="font-semibold">{entry.username}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{entry.total_points}</p>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
