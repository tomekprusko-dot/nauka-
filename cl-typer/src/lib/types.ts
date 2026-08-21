export interface Team {
  id: string;
  name: string;
  shortName: string;
  country: string;
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
  email: string;
  accessCode: string;
  role: UserRole;
}

export interface Prediction {
  userId: string;
  fixtureId: string;
  homeGoals: number;
  awayGoals: number;
  savedAt: string;
}

export interface StandingsRow {
  user: InvitedUser;
  points: number;
  exactHits: number;
  outcomeHits: number;
  predictionsMade: number;
  specialPoints: number;
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
