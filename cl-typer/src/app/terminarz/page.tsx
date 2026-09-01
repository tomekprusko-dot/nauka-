import { requireUser } from "@/lib/auth";
import { getUserPredictions, getResults, computeStandings, getFixtureNotes } from "@/lib/db";
import { fixtures } from "@/data/fixtures";
import TerminarzClient from "./TerminarzClient";

export default async function TerminarzPage() {
  const user = await requireUser();
  const [predictions, results, standings, fixtureNotes] = await Promise.all([
    getUserPredictions(user.id),
    getResults(),
    computeStandings(),
    getFixtureNotes(),
  ]);
  const myRow = standings.find((r) => r.user.id === user.id);

  return (
    <TerminarzClient
      fixtures={fixtures}
      initialPredictions={predictions}
      results={results}
      fixtureNotes={fixtureNotes}
      myPoints={myRow?.points ?? 0}
      myRank={myRow?.rank ?? null}
      hotStreak={myRow?.hotStreak ?? 0}
    />
  );
}
