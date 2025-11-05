import { useMemo } from "react";
import { FlagName } from "./FlagName";
import { computeKnockoutProgression } from "@/utils/knockoutProgression";

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  stage: string;
}

interface Prediction {
  match_id: string;
  user_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
}

interface KnockoutBracketProps {
  matches: Match[];
  predictions?: Prediction[];
  stage: string;
  title: string;
  isPredicted?: boolean;
  userId: string;
}

const STAGE_ORDER = ['R16', 'QF', 'SF', '3P', 'Final'];

export function KnockoutBracket({ matches, predictions = [], stage, title, isPredicted = false, userId }: KnockoutBracketProps) {
  // Compute the progressed bracket based on results
  const progressedMatches = useMemo(() => {
    return computeKnockoutProgression(matches, predictions, userId, isPredicted);
  }, [matches, predictions, userId, isPredicted]);

  const stageMatches = progressedMatches
    .filter(m => m.stage === stage)
    .sort((a, b) => a.id.localeCompare(b.id));

  if (stageMatches.length === 0) return null;

  // Get scores based on whether we're showing predictions or actuals
  const getScores = (match: Match) => {
    if (isPredicted && predictions) {
      const prediction = predictions.find(p => p.match_id === match.id);
      return {
        home: prediction?.predicted_home_score ?? null,
        away: prediction?.predicted_away_score ?? null
      };
    }
    return {
      home: match.home_score,
      away: match.away_score
    };
  };

  return (
    <div className="mb-4">
      <div className="text-sm font-medium mb-2 text-gray-700">{title}</div>
      <div className="space-y-2">
        {stageMatches.map(match => {
          const scores = getScores(match);
          return (
            <div key={match.id} className="flex items-center gap-2 py-2 px-3 bg-neutral-50 rounded border">
              <div className="flex-1 text-right font-medium">
                <FlagName name={match.home_team} />
              </div>
              <div className="flex items-center gap-2 min-w-[60px] justify-center">
                <span className="font-bold text-sm">
                  {scores.home ?? '-'}
                </span>
                <span className="text-neutral-400">:</span>
                <span className="font-bold text-sm">
                  {scores.away ?? '-'}
                </span>
              </div>
              <div className="flex-1 text-left font-medium">
                <FlagName name={match.away_team} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
