import { FixtureResult, Prediction } from "@/lib/types";

export const POINTS_EXACT = 3;
export const POINTS_OUTCOME = 1;
export const POINTS_MISS = 0;

function outcome(homeGoals: number, awayGoals: number): "H" | "D" | "A" {
  if (homeGoals > awayGoals) return "H";
  if (homeGoals < awayGoals) return "A";
  return "D";
}

export function scorePrediction(prediction: Prediction, result: FixtureResult): number {
  const exact =
    prediction.homeGoals === result.homeGoals && prediction.awayGoals === result.awayGoals;
  if (exact) return POINTS_EXACT;

  const sameOutcome =
    outcome(prediction.homeGoals, prediction.awayGoals) ===
    outcome(result.homeGoals, result.awayGoals);
  if (sameOutcome) return POINTS_OUTCOME;

  return POINTS_MISS;
}
