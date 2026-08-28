import { FixtureResult, MatchOutcome, Prediction } from "@/lib/types";

export const POINTS_CORRECT = 3;
export const POINTS_MISS = 0;
export const POINTS_SPECIAL = 10;

export function resultOutcome(homeGoals: number, awayGoals: number): MatchOutcome {
  if (homeGoals > awayGoals) return "H";
  if (homeGoals < awayGoals) return "A";
  return "D";
}

export function scorePrediction(prediction: Prediction, result: FixtureResult): number {
  const actual = resultOutcome(result.homeGoals, result.awayGoals);
  return prediction.outcome === actual ? POINTS_CORRECT : POINTS_MISS;
}
