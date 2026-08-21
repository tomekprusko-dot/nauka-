import { requireUser } from "@/lib/auth";
import { getUserPredictions } from "@/lib/db";
import { fixtures } from "@/data/fixtures";
import TerminarzClient from "./TerminarzClient";

export default async function TerminarzPage() {
  const user = await requireUser();
  const predictions = await getUserPredictions(user.id);

  return <TerminarzClient fixtures={fixtures} initialPredictions={predictions} />;
}
