import "server-only";
import { supabaseServer } from "@/lib/supabaseServer";
import { fixtures } from "@/data/fixtures";
import { scorePrediction, POINTS_SPECIAL } from "@/lib/scoring";
import {
  FixtureResult,
  InvitedUser,
  MatchOutcome,
  Prediction,
  SpecialPrediction,
  SpecialResult,
  StandingsRow,
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

interface SpecialPredictionRow {
  user_id: string;
  champion_team_id: string | null;
  top_scorer: string | null;
  saved_at: string;
}

function rowToSpecialPrediction(row: SpecialPredictionRow): SpecialPrediction {
  return {
    userId: row.user_id,
    championTeamId: row.champion_team_id,
    topScorer: row.top_scorer,
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

export async function saveSpecialPrediction(
  userId: string,
  championTeamId: string | null,
  topScorer: string | null,
): Promise<void> {
  const { error } = await supabaseServer()
    .from("special_predictions")
    .upsert(
      { user_id: userId, champion_team_id: championTeamId, top_scorer: topScorer, saved_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );
  if (error) throw error;
}

export async function getSpecialResult(): Promise<SpecialResult> {
  const { data, error } = await supabaseServer().from("special_result").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  return {
    championTeamId: (data?.champion_team_id as string | null | undefined) ?? null,
    topScorer: (data?.top_scorer as string | null | undefined) ?? null,
  };
}

export async function setSpecialResult(championTeamId: string | null, topScorer: string | null): Promise<void> {
  const { error } = await supabaseServer()
    .from("special_result")
    .upsert({ id: 1, champion_team_id: championTeamId, top_scorer: topScorer });
  if (error) throw error;
}

function scoreSpecial(prediction: SpecialPrediction | null, result: SpecialResult): number {
  if (!prediction) return 0;
  let points = 0;
  if (result.championTeamId && prediction.championTeamId === result.championTeamId) {
    points += POINTS_SPECIAL;
  }
  if (
    result.topScorer &&
    prediction.topScorer &&
    prediction.topScorer.trim().toLowerCase() === result.topScorer.trim().toLowerCase()
  ) {
    points += POINTS_SPECIAL;
  }
  return points;
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
    form: row.form,
    hotStreak: row.hotStreak,
    rank: i + 1,
    previousRank: latestResolvedMatchday === null ? null : (previousRankByUserId.get(row.user.id) ?? null),
  }));
}
