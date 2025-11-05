import { useMemo } from "react";
import { FlagName } from "./FlagName";

interface Match {
  id: string;
  home_team: string;
  away_team: string;
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

interface StandingRow {
  team: string;
  pts: number;
  gf: number;
  ga: number;
  gd: number;
}

interface GroupStandingsProps {
  group: string;
  matches: Match[];
  predictions: Prediction[];
  userId: string;
  username: string;
}

function computeGroupStandings(matches: Match[], group: string): StandingRow[] {
  const rows: Record<string, StandingRow> = {};
  const groupMatches = matches.filter((m) => m.stage === 'Group' && m.group === group);
  
  const touch = (t: string) => (rows[t] ??= { team: t, pts: 0, gf: 0, ga: 0, gd: 0 });

  // Initialize all teams in the group
  groupMatches.forEach((m) => {
    touch(m.home_team);
    touch(m.away_team);
  });

  // Process matches with scores
  groupMatches.forEach((m) => {
    if (m.home_score == null || m.away_score == null) return;
    const H = rows[m.home_team];
    const A = rows[m.away_team];
    H.gf += m.home_score;
    H.ga += m.away_score;
    H.gd = H.gf - H.ga;
    A.gf += m.away_score;
    A.ga += m.home_score;
    A.gd = A.gf - A.ga;
    if (m.home_score > m.away_score) H.pts += 3;
    else if (m.away_score > m.home_score) A.pts += 3;
    else {
      H.pts++;
      A.pts++;
    }
  });

  return Object.values(rows).sort(
    (x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf || x.team.localeCompare(y.team)
  );
}

function computeGroupStandingsFromPredictions(
  matches: Match[],
  predictions: Prediction[],
  group: string,
  userId: string
): StandingRow[] {
  const rows: Record<string, StandingRow> = {};
  const groupMatches = matches.filter((m) => m.stage === 'Group' && m.group === group);
  const touch = (t: string) => (rows[t] ??= { team: t, pts: 0, gf: 0, ga: 0, gd: 0 });

  // Initialize all teams in the group
  groupMatches.forEach((m) => {
    touch(m.home_team);
    touch(m.away_team);
  });

  // Process predictions
  groupMatches.forEach((m) => {
    const pred = predictions.find((p) => p.user_id === userId && p.match_id === m.id);
    if (!pred) return;
    const H = rows[m.home_team];
    const A = rows[m.away_team];
    H.gf += pred.predicted_home_score;
    H.ga += pred.predicted_away_score;
    H.gd = H.gf - H.ga;
    A.gf += pred.predicted_away_score;
    A.ga += pred.predicted_home_score;
    A.gd = A.gf - A.ga;
    if (pred.predicted_home_score > pred.predicted_away_score) H.pts += 3;
    else if (pred.predicted_away_score > pred.predicted_home_score) A.pts += 3;
    else {
      H.pts++;
      A.pts++;
    }
  });

  return Object.values(rows).sort(
    (x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf || x.team.localeCompare(y.team)
  );
}

function StandingsTable({ label, rows }: { label: string; rows: StandingRow[] }) {
  return (
    <div>
      <div className="font-medium mb-2 text-gray-700">{label}</div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-neutral-600 text-xs">
            <th className="pb-1">Team</th>
            <th className="pb-1 text-center">Pts</th>
            <th className="pb-1 text-center">GD</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center text-neutral-400 py-4">No data</td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr key={row.team} className={idx < 2 ? 'font-medium' : ''}>
                <td className="py-1">
                  <FlagName name={row.team} />
                </td>
                <td className="text-center py-1">{row.pts}</td>
                <td className="text-center py-1">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function GroupStandings({ group, matches, predictions, userId, username }: GroupStandingsProps) {
  const actualTable = useMemo(() => computeGroupStandings(matches, group), [matches, group]);
  const predictedTable = useMemo(
    () => computeGroupStandingsFromPredictions(matches, predictions, group, userId),
    [matches, predictions, group, userId]
  );

  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="font-semibold mb-3">Group {group} Standings</div>
      <div className="grid grid-cols-2 gap-4">
        <StandingsTable label="🏆 Actual" rows={actualTable} />
        <StandingsTable label={`📝 ${username}'s Prediction`} rows={predictedTable} />
      </div>
    </div>
  );
}
