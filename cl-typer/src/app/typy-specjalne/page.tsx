import { requireUser } from "@/lib/auth";
import { getUserSpecialPrediction, getSpecialResult } from "@/lib/db";
import { getTournamentStart } from "@/data/fixtures";
import TypySpecjalneClient from "./TypySpecjalneClient";

export default async function TypySpecjalnePage() {
  const user = await requireUser();
  const [prediction, result] = await Promise.all([
    getUserSpecialPrediction(user.id),
    getSpecialResult(),
  ]);

  return (
    <TypySpecjalneClient
      tournamentStart={getTournamentStart()}
      initialPrediction={prediction}
      result={result}
    />
  );
}
