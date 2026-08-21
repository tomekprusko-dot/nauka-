export interface Team {
  id: string;
  name: string;
  shortName: string;
  country: string;
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
}
