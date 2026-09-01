import "server-only";
import { supabaseServer } from "@/lib/supabaseServer";
import { fixtures } from "@/data/fixtures";
import { teams } from "@/data/teams";
import { scorePrediction, POINTS_SPECIAL } from "@/lib/scoring";
import {
  AutomationLogEntry,
  FixtureResult,
  InvitedUser,
  MatchdayRecap,
  MatchOutcome,
  NamedPrediction,
  Prediction,
  SpecialPrediction,
  SpecialResult,
  StandingsRow,
  TeamDetail,
  UserRole,
} from "@/lib/types";

/**
 * Data Access Layer — the only module allowed to talk to Supabase.
 * All reads/writes use the service-role key (server-only), so there are no
 * Row Level Security policies to maintain: nothing reaches this database
 * except through here, and every mutation is re-authorized by the caller
 * (see each route's actions.ts) before it gets this far.
 */

interface UserRow {
  id: string;
  name: string;
  email: string | null;
  access_code: string;
  role: UserRole;
}

function rowToUser(row: UserRow): InvitedUser {
  return { id: row.id, name: row.name, email: row.email, accessCode: row.access_code, role: row.role };
}

export async function getUsers(): Promise<InvitedUser[]> {
  const { data, error } = await supabaseServer().from("users").select("*").order("created_at");
  if (error) throw error;
  return (data as UserRow[]).map(rowToUser);
}

export async function getUserById(id: string): Promise<InvitedUser | null> {
  const { data, error } = await supabaseServer().from("users").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToUser(data as UserRow) : null;
}

export async function findUserByCredentials(
  nameOrEmail: string,
  accessCode: string,
): Promise<InvitedUser | null> {
  const needle = nameOrEmail.trim().toLowerCase();
  const code = accessCode.trim().toLowerCase();
  const users = await getUsers();
  return (
    users.find(
      (u) =>
        (u.name.toLowerCase() === needle || u.email?.toLowerCase() === needle) &&
        u.accessCode.toLowerCase() === code,
    ) ?? null
  );
}

export async function addUser(user: Omit<InvitedUser, "id">): Promise<InvitedUser> {
  const { data, error } = await supabaseServer()
    .from("users")
    .insert({ name: user.name, email: user.email, access_code: user.accessCode, role: user.role })
    .select()
    .single();
  if (error) throw error;
  return rowToUser(data as UserRow);
}

export async function removeUser(id: string): Promise<void> {
  const { error } = await supabaseServer().from("users").delete().eq("id", id);
  if (error) throw error;
}

interface ResultRow {
  fixture_id: string;
  home_goals: number;
  away_goals: number;
}

function rowToResult(row: ResultRow): FixtureResult {
  return { fixtureId: row.fixture_id, homeGoals: row.home_goals, awayGoals: row.away_goals };
}

export async function getResults(): Promise<Record<string, FixtureResult>> {
  const { data, error } = await supabaseServer().from("results").select("*");
  if (error) throw error;
  const out: Record<string, FixtureResult> = {};
  for (const row of data as ResultRow[]) out[row.fixture_id] = rowToResult(row);
  return out;
}

export async function setResult(fixtureId: string, homeGoals: number, awayGoals: number): Promise<void> {
  const { error } = await supabaseServer()
    .from("results")
    .upsert({ fixture_id: fixtureId, home_goals: homeGoals, away_goals: awayGoals, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function getFixtureNotes(): Promise<Record<string, string[]>> {
  const { data, error } = await supabaseServer().from("fixture_notes").select("*");
  // Ciekawostki są dodatkiem kosmetycznym — jeśli tabela jeszcze nie istnieje
  // (migracja SQL nie została wklejona) albo zapytanie się nie powiedzie,
  // Terminarz ma dalej działać normalnie, tylko bez tej sekcji.
  if (error) return {};
  const out: Record<string, string[]> = {};
  for (const row of data as { fixture_id: string; notes: string[] }[]) out[row.fixture_id] = row.notes;
  return out;
}

interface PredictionRow {
  user_id: string;
  fixture_id: string;
  outcome: MatchOutcome;
  saved_at: string;
}

function rowToPrediction(row: PredictionRow): Prediction {
  return {
    userId: row.user_id,
    fixtureId: row.fixture_id,
    outcome: row.outcome,
    savedAt: row.saved_at,
  };
}

export async function getAllPredictions(): Promise<Prediction[]> {
  const { data, error } = await supabaseServer().from("predictions").select("*");
  if (error) throw error;
  return (data as PredictionRow[]).map(rowToPrediction);
}

export async function getUserPredictions(userId: string): Promise<Record<string, Prediction>> {
  const { data, error } = await supabaseServer().from("predictions").select("*").eq("user_id", userId);
  if (error) throw error;
  const out: Record<string, Prediction> = {};
  for (const row of data as PredictionRow[]) out[row.fixture_id] = rowToPrediction(row);
  return out;
}

/** Every prediction ever made, grouped by fixture, with names resolved — used to reveal how everyone typed once a match has kicked off. */
export async function getPredictionsByFixture(): Promise<Record<string, NamedPrediction[]>> {
  const [predictions, users] = await Promise.all([getAllPredictions(), getUsers()]);
  const nameById = new Map(users.map((u) => [u.id, u.name]));
  const out: Record<string, NamedPrediction[]> = {};
  for (const p of predictions) {
    const list = out[p.fixtureId] ?? [];
    list.push({ userId: p.userId, userName: nameById.get(p.userId) ?? "?", outcome: p.outcome });
    out[p.fixtureId] = list;
  }
  return out;
}

export async function savePrediction(
  userId: string,
  fixtureId: string,
  outcome: MatchOutcome,
): Promise<void> {
  const { error } = await supabaseServer()
    .from("predictions")
    .upsert(
      {
        user_id: userId,
        fixture_id: fixtureId,
        outcome,
        saved_at: new Date().toISOString(),
      },
      { onConflict: "user_id,fixture_id" },
    );
  if (error) throw error;
}

export async function deletePrediction(userId: string, fixtureId: string): Promise<void> {
  const { error } = await supabaseServer()
    .from("predictions")
    .delete()
    .eq("user_id", userId)
    .eq("fixture_id", fixtureId);
  if (error) throw error;
}

interface SpecialPredictionRow {
  user_id: string;
  champion_team_id: string | null;
  saved_at: string;
}

function rowToSpecialPrediction(row: SpecialPredictionRow): SpecialPrediction {
  return {
    userId: row.user_id,
    championTeamId: row.champion_team_id,
    savedAt: row.saved_at,
  };
}

export async function getAllSpecialPredictions(): Promise<Record<string, SpecialPrediction>> {
  const { data, error } = await supabaseServer().from("special_predictions").select("*");
  if (error) throw error;
  const out: Record<string, SpecialPrediction> = {};
  for (const row of data as SpecialPredictionRow[]) out[row.user_id] = rowToSpecialPrediction(row);
  return out;
}

export async function getUserSpecialPrediction(userId: string): Promise<SpecialPrediction | null> {
  const { data, error } = await supabaseServer()
    .from("special_predictions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToSpecialPrediction(data as SpecialPredictionRow) : null;
}

export async function saveSpecialPrediction(userId: string, championTeamId: string | null): Promise<void> {
  const { error } = await supabaseServer()
    .from("special_predictions")
    .upsert(
      { user_id: userId, champion_team_id: championTeamId, saved_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );
  if (error) throw error;
}

export async function getSpecialResult(): Promise<SpecialResult> {
  const { data, error } = await supabaseServer().from("special_result").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  return {
    championTeamId: (data?.champion_team_id as string | null | undefined) ?? null,
  };
}

export async function setSpecialResult(championTeamId: string | null): Promise<void> {
  const { error } = await supabaseServer().from("special_result").upsert({ id: 1, champion_team_id: championTeamId });
  if (error) throw error;
}

function scoreSpecial(prediction: SpecialPrediction | null, result: SpecialResult): number {
  if (!prediction) return 0;
  if (result.championTeamId && prediction.championTeamId === result.championTeamId) {
    return POINTS_SPECIAL;
  }
  return 0;
}

export async function computeStandings(): Promise<StandingsRow[]> {
  const [users, results, allPredictions, allSpecialPredictions, specialResult] = await Promise.all([
    getUsers(),
    getResults(),
    getAllPredictions(),
    getAllSpecialPredictions(),
    getSpecialResult(),
  ]);

  const fixtureById = new Map(fixtures.map((f) => [f.id, f]));

  // The most recently played matchday with at least one recorded result —
  // used to compute each user's rank *before* that round, for an
  // "Awans/Spadek o X pozycji" badge.
  let latestResolvedMatchday: number | null = null;
  for (const fixtureId of Object.keys(results)) {
    const fixture = fixtureById.get(fixtureId);
    if (fixture && (latestResolvedMatchday === null || fixture.matchday > latestResolvedMatchday)) {
      latestResolvedMatchday = fixture.matchday;
    }
  }

  const base = users.map((user) => {
    const userPredictions = allPredictions.filter((p) => p.userId === user.id);
    const picks: { matchday: number; kickoff: string; score: number }[] = [];
    let correctHits = 0;
    let points = 0;
    let previousPoints = 0;

    for (const prediction of userPredictions) {
      const result = results[prediction.fixtureId];
      const fixture = fixtureById.get(prediction.fixtureId);
      if (!result || !fixture) continue;

      const score = scorePrediction(prediction, result);
      points += score;
      if (fixture.matchday !== latestResolvedMatchday) previousPoints += score;
      if (score > 0) correctHits += 1;
      picks.push({ matchday: fixture.matchday, kickoff: fixture.kickoff, score });
    }

    picks.sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
    const form = picks.slice(-5).map((p) => p.score);

    let hotStreak = 0;
    for (let i = picks.length - 1; i >= 0; i--) {
      if (picks[i].score === 0) break;
      hotStreak += 1;
    }
    if (hotStreak < 3) hotStreak = 0;

    const specialPoints = scoreSpecial(allSpecialPredictions[user.id] ?? null, specialResult);
    points += specialPoints;
    previousPoints += specialPoints;

    return {
      user,
      points,
      previousPoints,
      correctHits,
      predictionsMade: userPredictions.length,
      specialPoints,
      championTeamId: allSpecialPredictions[user.id]?.championTeamId ?? null,
      form,
      hotStreak,
    };
  });

  const ranked = [...base].sort((a, b) => b.points - a.points || b.correctHits - a.correctHits);
  const previousRanked = [...base].sort((a, b) => b.previousPoints - a.previousPoints);
  const previousRankByUserId = new Map<string, number>();
  previousRanked.forEach((row, i) => previousRankByUserId.set(row.user.id, i + 1));

  return ranked.map((row, i) => ({
    user: row.user,
    points: row.points,
    correctHits: row.correctHits,
    predictionsMade: row.predictionsMade,
    specialPoints: row.specialPoints,
    championTeamId: row.championTeamId,
    form: row.form,
    hotStreak: row.hotStreak,
    rank: i + 1,
    previousRank: latestResolvedMatchday === null ? null : (previousRankByUserId.get(row.user.id) ?? null),
  }));
}

/**
 * The real Ekstraklasa league table, one full profile per team: position,
 * points, home/away splits, full match history, and — from our own
 * `predictions` table — how our typers have actually picked matches
 * involving this team (win/draw/loss %), aggregated across the season.
 */
export async function computeTeamDetails(): Promise<Record<string, TeamDetail>> {
  const [results, allPredictions] = await Promise.all([getResults(), getAllPredictions()]);
  const fixtureById = new Map(fixtures.map((f) => [f.id, f]));

  const emptySplit = () => ({ played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 });
  const details = new Map<string, TeamDetail>(
    teams.map((team) => [
      team.id,
      {
        teamId: team.id,
        rank: 0,
        points: 0,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDiff: 0,
        home: emptySplit(),
        away: emptySplit(),
        form: [],
        matches: [],
        fanSentiment: null,
      },
    ]),
  );

  const playedFixtures = fixtures
    .filter((f) => results[f.id])
    .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());

  for (const fixture of playedFixtures) {
    const result = results[fixture.id];
    const home = details.get(fixture.homeTeamId);
    const away = details.get(fixture.awayTeamId);
    if (!result || !home || !away) continue;

    home.played += 1;
    away.played += 1;
    home.goalsFor += result.homeGoals;
    home.goalsAgainst += result.awayGoals;
    away.goalsFor += result.awayGoals;
    away.goalsAgainst += result.homeGoals;
    home.home.played += 1;
    away.away.played += 1;
    home.home.goalsFor += result.homeGoals;
    home.home.goalsAgainst += result.awayGoals;
    away.away.goalsFor += result.awayGoals;
    away.away.goalsAgainst += result.homeGoals;

    let homeOutcome: "W" | "D" | "L";
    let awayOutcome: "W" | "D" | "L";
    if (result.homeGoals > result.awayGoals) {
      home.won += 1;
      home.points += 3;
      home.home.won += 1;
      away.lost += 1;
      away.away.lost += 1;
      homeOutcome = "W";
      awayOutcome = "L";
    } else if (result.homeGoals < result.awayGoals) {
      away.won += 1;
      away.points += 3;
      away.away.won += 1;
      home.lost += 1;
      home.home.lost += 1;
      homeOutcome = "L";
      awayOutcome = "W";
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
      home.home.drawn += 1;
      away.away.drawn += 1;
      homeOutcome = "D";
      awayOutcome = "D";
    }

    home.matches.push({
      fixtureId: fixture.id,
      matchday: fixture.matchday,
      opponentId: fixture.awayTeamId,
      isHome: true,
      goalsFor: result.homeGoals,
      goalsAgainst: result.awayGoals,
      outcome: homeOutcome,
    });
    away.matches.push({
      fixtureId: fixture.id,
      matchday: fixture.matchday,
      opponentId: fixture.homeTeamId,
      isHome: false,
      goalsFor: result.awayGoals,
      goalsAgainst: result.homeGoals,
      outcome: awayOutcome,
    });
  }

  for (const detail of details.values()) {
    detail.goalDiff = detail.goalsFor - detail.goalsAgainst;
    detail.form = detail.matches.slice(-5).map((m) => m.outcome);
  }

  const ranked = [...details.values()].sort(
    (a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor,
  );
  ranked.forEach((detail, i) => (detail.rank = i + 1));

  const sentimentCounts = new Map<string, { win: number; draw: number; loss: number }>();
  for (const prediction of allPredictions) {
    const fixture = fixtureById.get(prediction.fixtureId);
    if (!fixture) continue;
    for (const { teamId, isHomeTeam } of [
      { teamId: fixture.homeTeamId, isHomeTeam: true },
      { teamId: fixture.awayTeamId, isHomeTeam: false },
    ]) {
      const counts = sentimentCounts.get(teamId) ?? { win: 0, draw: 0, loss: 0 };
      if (prediction.outcome === "D") counts.draw += 1;
      else if ((isHomeTeam && prediction.outcome === "H") || (!isHomeTeam && prediction.outcome === "A")) {
        counts.win += 1;
      } else {
        counts.loss += 1;
      }
      sentimentCounts.set(teamId, counts);
    }
  }
  for (const [teamId, counts] of sentimentCounts) {
    const detail = details.get(teamId);
    const total = counts.win + counts.draw + counts.loss;
    if (!detail || total === 0) continue;
    detail.fanSentiment = {
      winPct: Math.round((counts.win / total) * 100),
      drawPct: Math.round((counts.draw / total) * 100),
      lossPct: Math.round((counts.loss / total) * 100),
      totalPicks: total,
    };
  }

  return Object.fromEntries(details);
}

export async function addAutomationLog(message: string): Promise<void> {
  const { error } = await supabaseServer().from("automation_log").insert({ message });
  if (error) throw error;
}

export async function getLatestMatchdayRecap(): Promise<MatchdayRecap | null> {
  const { data, error } = await supabaseServer()
    .from("matchday_recaps")
    .select("*")
    .order("matchday", { ascending: false })
    .limit(1)
    .maybeSingle();
  // Kosmetyczny dodatek — jeśli tabela jeszcze nie istnieje albo coś pójdzie
  // nie tak, Tabela typerów ma dalej działać normalnie, tylko bez baneru.
  if (error || !data) return null;
  return { matchday: data.matchday, recap: data.recap, points: data.points ?? {}, createdAt: data.created_at };
}

export async function getAutomationLog(limit = 20): Promise<AutomationLogEntry[]> {
  const { data, error } = await supabaseServer()
    .from("automation_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row) => ({ id: row.id, message: row.message, createdAt: row.created_at }));
}
