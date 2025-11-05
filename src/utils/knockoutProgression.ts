interface Match {
  id: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  stage: string;
  group?: string;
}

interface Prediction {
  match_id: string;
  user_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
}

interface StandingRow {
  team: string;
  points: number;
  goalDiff: number;
  goalsFor: number;
}

// Compute group standings to determine qualifiers
function computeGroupStandings(matches: Match[], group: string): StandingRow[] {
  const teams = new Set<string>();
  matches
    .filter(m => m.group === group && m.stage === 'Group')
    .forEach(m => {
      teams.add(m.home_team);
      teams.add(m.away_team);
    });

  const standings: Record<string, StandingRow> = {};
  teams.forEach(team => {
    standings[team] = { team, points: 0, goalDiff: 0, goalsFor: 0 };
  });

  matches
    .filter(m => m.group === group && m.stage === 'Group' && m.home_score !== null && m.away_score !== null)
    .forEach(m => {
      const homeGoals = m.home_score!;
      const awayGoals = m.away_score!;

      standings[m.home_team].goalsFor += homeGoals;
      standings[m.home_team].goalDiff += homeGoals - awayGoals;
      standings[m.away_team].goalsFor += awayGoals;
      standings[m.away_team].goalDiff += awayGoals - homeGoals;

      if (homeGoals > awayGoals) {
        standings[m.home_team].points += 3;
      } else if (awayGoals > homeGoals) {
        standings[m.away_team].points += 3;
      } else {
        standings[m.home_team].points += 1;
        standings[m.away_team].points += 1;
      }
    });

  return Object.values(standings).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    return b.goalsFor - a.goalsFor;
  });
}

// Compute group standings from predictions
function computeGroupStandingsFromPredictions(
  matches: Match[],
  predictions: Prediction[],
  group: string,
  userId: string
): StandingRow[] {
  const teams = new Set<string>();
  matches
    .filter(m => m.group === group && m.stage === 'Group')
    .forEach(m => {
      teams.add(m.home_team);
      teams.add(m.away_team);
    });

  const standings: Record<string, StandingRow> = {};
  teams.forEach(team => {
    standings[team] = { team, points: 0, goalDiff: 0, goalsFor: 0 };
  });

  matches
    .filter(m => m.group === group && m.stage === 'Group')
    .forEach(m => {
      const prediction = predictions.find(p => p.match_id === m.id && p.user_id === userId);
      if (!prediction) return;

      const homeGoals = prediction.predicted_home_score;
      const awayGoals = prediction.predicted_away_score;

      standings[m.home_team].goalsFor += homeGoals;
      standings[m.home_team].goalDiff += homeGoals - awayGoals;
      standings[m.away_team].goalsFor += awayGoals;
      standings[m.away_team].goalDiff += awayGoals - homeGoals;

      if (homeGoals > awayGoals) {
        standings[m.home_team].points += 3;
      } else if (awayGoals > homeGoals) {
        standings[m.away_team].points += 3;
      } else {
        standings[m.home_team].points += 1;
        standings[m.away_team].points += 1;
      }
    });

  return Object.values(standings).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    return b.goalsFor - a.goalsFor;
  });
}

// Get match winner based on scores
function getWinner(homeScore: number | null, awayScore: number | null, homeTeam: string, awayTeam: string): string | null {
  if (homeScore === null || awayScore === null) return null;
  if (homeScore > awayScore) return homeTeam;
  if (awayScore > homeScore) return awayTeam;
  return null; // Draw - would need penalty shootout
}

// Build a mapping of R16 match indices to determine progression
const R16_TO_QF_MAP: Record<number, number> = {
  1: 1, 2: 1, // R16-1 and R16-2 winners go to QF-1
  3: 2, 4: 2, // R16-3 and R16-4 winners go to QF-2
  5: 3, 6: 3, // R16-5 and R16-6 winners go to QF-3
  7: 4, 8: 4, // R16-7 and R16-8 winners go to QF-4
};

const QF_TO_SF_MAP: Record<number, number> = {
  1: 1, 2: 1, // QF-1 and QF-2 winners go to SF-1
  3: 2, 4: 2, // QF-3 and QF-4 winners go to SF-2
};

export function computeKnockoutProgression(
  matches: Match[],
  predictions: Prediction[],
  userId: string,
  isPredicted: boolean
): Match[] {
  const processedMatches = [...matches];
  
  // Step 1: Resolve R16 qualifiers from group stages
  const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const qualifiers: Record<string, string[]> = {};
  
  groups.forEach(group => {
    const standings = isPredicted 
      ? computeGroupStandingsFromPredictions(matches, predictions, group, userId)
      : computeGroupStandings(matches, group);
    
    qualifiers[group] = standings.slice(0, 2).map(s => s.team);
  });

  // Update R16 matches with qualifiers
  processedMatches.forEach(match => {
    if (match.stage === 'R16') {
      let homeTeam = match.home_team;
      let awayTeam = match.away_team;

      // Replace TBD placeholders with actual qualifiers
      Object.entries(qualifiers).forEach(([group, [first, second]]) => {
        homeTeam = homeTeam.replace(`TBD ${group}1`, first);
        awayTeam = awayTeam.replace(`TBD ${group}1`, first);
        homeTeam = homeTeam.replace(`TBD ${group}2`, second);
        awayTeam = awayTeam.replace(`TBD ${group}2`, second);
      });

      match.home_team = homeTeam;
      match.away_team = awayTeam;
    }
  });

  // Step 2: Compute R16 winners and propagate to QF
  const r16Matches = processedMatches.filter(m => m.stage === 'R16').sort((a, b) => a.id.localeCompare(b.id));
  const r16Winners: Record<number, string | null> = {};

  r16Matches.forEach((match, index) => {
    const matchNum = index + 1;
    let homeScore: number | null;
    let awayScore: number | null;

    if (isPredicted) {
      const pred = predictions.find(p => p.match_id === match.id && p.user_id === userId);
      homeScore = pred?.predicted_home_score ?? null;
      awayScore = pred?.predicted_away_score ?? null;
    } else {
      homeScore = match.home_score;
      awayScore = match.away_score;
    }

    r16Winners[matchNum] = getWinner(homeScore, awayScore, match.home_team, match.away_team);
  });

  // Update QF matches with R16 winners
  const qfMatches = processedMatches.filter(m => m.stage === 'QF').sort((a, b) => a.id.localeCompare(b.id));
  qfMatches.forEach((match, index) => {
    const qfNum = index + 1;
    let homeTeam = match.home_team;
    let awayTeam = match.away_team;

    // Find which R16 matches feed into this QF match
    Object.entries(R16_TO_QF_MAP).forEach(([r16Num, targetQf]) => {
      if (targetQf === qfNum && r16Winners[Number(r16Num)]) {
        const winner = r16Winners[Number(r16Num)]!;
        homeTeam = homeTeam.replace(`Winner R16-${r16Num}`, winner);
        awayTeam = awayTeam.replace(`Winner R16-${r16Num}`, winner);
      }
    });

    match.home_team = homeTeam;
    match.away_team = awayTeam;
  });

  // Step 3: Compute QF winners and propagate to SF
  const qfWinners: Record<number, string | null> = {};

  qfMatches.forEach((match, index) => {
    const qfNum = index + 1;
    let homeScore: number | null;
    let awayScore: number | null;

    if (isPredicted) {
      const pred = predictions.find(p => p.match_id === match.id && p.user_id === userId);
      homeScore = pred?.predicted_home_score ?? null;
      awayScore = pred?.predicted_away_score ?? null;
    } else {
      homeScore = match.home_score;
      awayScore = match.away_score;
    }

    qfWinners[qfNum] = getWinner(homeScore, awayScore, match.home_team, match.away_team);
  });

  // Update SF matches with QF winners
  const sfMatches = processedMatches.filter(m => m.stage === 'SF').sort((a, b) => a.id.localeCompare(b.id));
  sfMatches.forEach((match, index) => {
    const sfNum = index + 1;
    let homeTeam = match.home_team;
    let awayTeam = match.away_team;

    Object.entries(QF_TO_SF_MAP).forEach(([qfNum, targetSf]) => {
      if (targetSf === sfNum && qfWinners[Number(qfNum)]) {
        const winner = qfWinners[Number(qfNum)]!;
        homeTeam = homeTeam.replace(`Winner QF-${qfNum}`, winner);
        awayTeam = awayTeam.replace(`Winner QF-${qfNum}`, winner);
      }
    });

    match.home_team = homeTeam;
    match.away_team = awayTeam;
  });

  // Step 4: Compute SF winners and losers, propagate to Final and 3P
  const sfWinners: Record<number, string | null> = {};
  const sfLosers: Record<number, string | null> = {};

  sfMatches.forEach((match, index) => {
    const sfNum = index + 1;
    let homeScore: number | null;
    let awayScore: number | null;

    if (isPredicted) {
      const pred = predictions.find(p => p.match_id === match.id && p.user_id === userId);
      homeScore = pred?.predicted_home_score ?? null;
      awayScore = pred?.predicted_away_score ?? null;
    } else {
      homeScore = match.home_score;
      awayScore = match.away_score;
    }

    const winner = getWinner(homeScore, awayScore, match.home_team, match.away_team);
    sfWinners[sfNum] = winner;
    
    if (winner && homeScore !== null && awayScore !== null) {
      sfLosers[sfNum] = winner === match.home_team ? match.away_team : match.home_team;
    } else {
      sfLosers[sfNum] = null;
    }
  });

  // Update Final match
  const finalMatch = processedMatches.find(m => m.stage === 'Final');
  if (finalMatch) {
    let homeTeam = finalMatch.home_team;
    let awayTeam = finalMatch.away_team;

    if (sfWinners[1]) {
      homeTeam = homeTeam.replace('Winner SF-1', sfWinners[1]);
      awayTeam = awayTeam.replace('Winner SF-1', sfWinners[1]);
    }
    if (sfWinners[2]) {
      homeTeam = homeTeam.replace('Winner SF-2', sfWinners[2]);
      awayTeam = awayTeam.replace('Winner SF-2', sfWinners[2]);
    }

    finalMatch.home_team = homeTeam;
    finalMatch.away_team = awayTeam;
  }

  // Update 3rd Place match
  const thirdPlaceMatch = processedMatches.find(m => m.stage === '3P');
  if (thirdPlaceMatch) {
    let homeTeam = thirdPlaceMatch.home_team;
    let awayTeam = thirdPlaceMatch.away_team;

    if (sfLosers[1]) {
      homeTeam = homeTeam.replace('Loser SF-1', sfLosers[1]);
      awayTeam = awayTeam.replace('Loser SF-1', sfLosers[1]);
    }
    if (sfLosers[2]) {
      homeTeam = homeTeam.replace('Loser SF-2', sfLosers[2]);
      awayTeam = awayTeam.replace('Loser SF-2', sfLosers[2]);
    }

    thirdPlaceMatch.home_team = homeTeam;
    thirdPlaceMatch.away_team = awayTeam;
  }

  return processedMatches;
}
