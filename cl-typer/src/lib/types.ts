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
}

/** A user's one-off, pre-season picks: who wins it all and who's top scorer. */
export interface SpecialPrediction {
  userId: string;
  championTeamId: string | null;
  topScorer: string | null;
  savedAt: string;
}

/** The real outcome, set by the admin once known — used to score special picks. */
export interface SpecialResult {
  championTeamId: string | null;
  topScorer: string | null;
}
