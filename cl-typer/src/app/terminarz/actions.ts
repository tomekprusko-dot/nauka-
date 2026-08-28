"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { savePrediction } from "@/lib/db";
import { fixtures } from "@/data/fixtures";
import { MatchOutcome } from "@/lib/types";

const VALID_OUTCOMES: MatchOutcome[] = ["H", "D", "A"];

export async function savePredictionAction(fixtureId: string, outcome: MatchOutcome) {
  const user = await requireUser();

  const fixture = fixtures.find((f) => f.id === fixtureId);
  if (!fixture) {
    throw new Error("Nieznany mecz.");
  }
  if (new Date(fixture.kickoff).getTime() <= Date.now()) {
    throw new Error("Ten mecz już się rozpoczął — typ jest zablokowany.");
  }
  if (!VALID_OUTCOMES.includes(outcome)) {
    throw new Error("Nieprawidłowy typ.");
  }

  await savePrediction(user.id, fixtureId, outcome);
  revalidatePath("/terminarz");
  revalidatePath("/ranking");
}
