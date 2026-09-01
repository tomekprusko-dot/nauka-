export interface Team {
  id: string;
  name: string;
  shortName: string;
  city: string;
  /** Approximate kit colors, used for the little badge next to the team name. */
  colors: { bg: string; fg: string };
}

export interface Fixture {
  id: string;
  matchday: number;
  homeTeamId: string;
  awayTeamId: string;
  kickoff: string; // ISO 8601
}

export interface FixtureResult {
  fixtureId: string;
  homeGoals: number;
  awayGoals: number;
}

export type UserRole = "admin" | "user";

export interface InvitedUser {
  id: string;
  name: string;
  email: string | null;
  accessCode: string;
  role: UserRole;
}

/** 'H' = wygrana gospodarzy, 'D' = remis, 'A' = wygrana gości. */
export type MatchOutcome = "H" | "D" | "A";

export interface Prediction {
  userId: string;
  fixtureId: string;
  outcome: MatchOutcome;
  savedAt: string;
}

export interface StandingsRow {
  user: InvitedUser;
  points: number;
  correctHits: number;
  predictionsMade: number;
  specialPoints: number;
  rank: number;
  /** Rank before the most recently resolved matchday, for an "Awans/Spadek o X pozycji" badge. Null until at least one matchday has results. */
  previousRank: number | null;
  /** Last up to 5 scored picks (0 | 1 | 3 points each), oldest to newest. */
  form: number[];
  /** Consecutive most-recent scoring (non-zero) picks, only set once it reaches 3+. */
  hotStreak: number;
  /** This user's champion pick, if any — only shown in the UI once the pick deadline has passed. */
  championTeamId: string | null;
}

/** A user's one-off, pre-season pick: who wins it all. */
export interface SpecialPrediction {
  userId: string;
  championTeamId: string | null;
  savedAt: string;
}

/** The real outcome, set by the admin once known — used to score the special pick. */
export interface SpecialResult {
  championTeamId: string | null;
}

/** A short note left by the automated fixtures/results sync when it needs manual attention. */
export interface AutomationLogEntry {
  id: number;
  message: string;
  createdAt: string;
}

/** An auto-generated, needling recap of who typed worst in a completed matchday. */
export interface MatchdayRecap {
  matchday: number;
  recap: string;
  createdAt: string;
}

/** One team's row in the real Ekstraklasa league table (not the typers' ranking). */
export interface LeagueTableRow {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}
