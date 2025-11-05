import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Leaderboard } from "@/components/Leaderboard";
import { GroupStandings } from "@/components/GroupStandings";
import { MatchPredictionRow } from "@/components/MatchPredictionRow";
import { KnockoutBracket } from "@/components/KnockoutBracket";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-stadium.jpg";

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  match_time: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
  group?: string;
  stage: string;
}

interface Prediction {
  match_id: string;
  user_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
}

const Index = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('A');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [matchesRes, predictionsRes, profileRes] = await Promise.all([
        supabase.from('matches').select('*').order('match_time', { ascending: true }),
        supabase.from('predictions').select('*'),
        supabase.from('profiles').select('username').eq('id', user?.id).single()
      ]);

      if (matchesRes.error) throw matchesRes.error;
      if (predictionsRes.error) throw predictionsRes.error;

      setMatches(matchesRes.data || []);
      setPredictions(predictionsRes.data || []);
    } catch (error: any) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const groupMatches = matches.filter(m => m.stage === 'Group' && m.group === activeTab);
  const knockoutMatches = matches.filter(m => m.stage !== 'Group');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${heroImage})`,
          }}
        />
        <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)', opacity: 0.85 }} />
        
        <div className="relative z-10 text-center text-white px-4">
          <div className="absolute top-4 right-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-4 animate-fade-up">
            World Cup Score Predictor
          </h1>
          <p className="text-xl md:text-2xl mb-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Predict match scores and compete with friends!
          </p>
          <p className="text-lg mb-8 animate-fade-up" style={{ animationDelay: '0.15s' }}>
            Welcome, {user?.email}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8 bg-neutral-50 min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Section */}
          <div className="lg:col-span-3 space-y-6">
            {/* Group Stage */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-2xl font-bold mb-4">Group Stage</h2>
              
              {/* Group Tabs */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {groups.map(g => (
                  <button
                    key={g}
                    onClick={() => setActiveTab(g)}
                    className={`px-4 py-2 rounded font-medium transition-colors ${
                      activeTab === g
                        ? 'bg-blue-600 text-white'
                        : 'bg-neutral-100 text-gray-700 hover:bg-neutral-200'
                    }`}
                  >
                    Group {g}
                  </button>
                ))}
              </div>

              {/* Group Content */}
              <div className="grid lg:grid-cols-3 gap-4">
                {/* Matches */}
                <div className="lg:col-span-2 bg-white rounded-xl border p-4">
                  <div className="font-semibold mb-3">Matches</div>
                  <div>
                    {groupMatches.length > 0 ? (
                      groupMatches.map(match => (
                        <MatchPredictionRow
                          key={match.id}
                          match={match}
                          userId={user?.id || ''}
                          onPredictionChange={fetchData}
                        />
                      ))
                    ) : (
                      <p className="text-center text-neutral-400 py-4">No matches in this group</p>
                    )}
                  </div>
                </div>

                {/* Standings */}
                <div>
                  <GroupStandings
                    group={activeTab}
                    matches={matches}
                    predictions={predictions}
                    userId={user?.id || ''}
                    username={user?.email?.split('@')[0] || 'User'}
                  />
                </div>
              </div>
            </div>

            {/* Knockout Stage */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-2xl font-bold mb-4">Knockout Stage</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="font-semibold mb-3 text-lg">🏆 Actual Bracket</div>
                  <KnockoutBracket 
                    matches={knockoutMatches} 
                    stage="R16" 
                    title="Round of 16"
                    userId={user?.id || ''}
                  />
                  <KnockoutBracket 
                    matches={knockoutMatches} 
                    stage="QF" 
                    title="Quarter Finals"
                    userId={user?.id || ''}
                  />
                  <KnockoutBracket 
                    matches={knockoutMatches} 
                    stage="SF" 
                    title="Semi Finals"
                    userId={user?.id || ''}
                  />
                  <KnockoutBracket 
                    matches={knockoutMatches} 
                    stage="3P" 
                    title="3rd Place"
                    userId={user?.id || ''}
                  />
                  <KnockoutBracket 
                    matches={knockoutMatches} 
                    stage="Final" 
                    title="Final"
                    userId={user?.id || ''}
                  />
                </div>
                <div>
                  <div className="font-semibold mb-3 text-lg">📝 Your Predictions</div>
                  <KnockoutBracket 
                    matches={knockoutMatches} 
                    predictions={predictions}
                    stage="R16" 
                    title="Round of 16" 
                    isPredicted={true}
                    userId={user?.id || ''}
                  />
                  <KnockoutBracket 
                    matches={knockoutMatches} 
                    predictions={predictions}
                    stage="QF" 
                    title="Quarter Finals" 
                    isPredicted={true}
                    userId={user?.id || ''}
                  />
                  <KnockoutBracket 
                    matches={knockoutMatches} 
                    predictions={predictions}
                    stage="SF" 
                    title="Semi Finals" 
                    isPredicted={true}
                    userId={user?.id || ''}
                  />
                  <KnockoutBracket 
                    matches={knockoutMatches} 
                    predictions={predictions}
                    stage="3P" 
                    title="3rd Place" 
                    isPredicted={true}
                    userId={user?.id || ''}
                  />
                  <KnockoutBracket 
                    matches={knockoutMatches} 
                    predictions={predictions}
                    stage="Final" 
                    title="Final" 
                    isPredicted={true}
                    userId={user?.id || ''}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard Section */}
          <div className="lg:col-span-1">
            <Leaderboard />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;