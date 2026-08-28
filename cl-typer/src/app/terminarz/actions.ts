"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { savePrediction, deletePrediction } from "@/lib/db";
import { fixtures, TYPING_OPENS_FROM_MATCHDAY } from "@/data/fixtures";
import { MatchOutcome } from "@/lib/types";

const VALID_OUTCOMES: MatchOutcome[] = ["H", "D", "A"];

function requireUnlockedFixture(fixtureId: string) {
  const fixture = fixtures.find((f) => f.id === fixtureId);
  if (!fixture) {
    throw new Error("Nieznany mecz.");
  }
  if (fixture.matchday < TYPING_OPENS_FROM_MATCHDAY) {
    throw new Error("Typowanie tej kolejki jest zamknięte.");
  }
  if (new Date(fixture.kickoff).getTime() <= Date.now()) {
    throw new Error("Ten mecz już się rozpoczął — typ jest zablokowany.");
  }
}

export async function savePredictionAction(fixtureId: string, outcome: MatchOutcome) {
  const user = await requireUser();
  requireUnlockedFixture(fixtureId);
  if (!VALID_OUTCOMES.includes(outcome)) {
    throw new Error("Nieprawidłowy typ.");
  }

  await savePrediction(user.id, fixtureId, outcome);
  revalidatePath("/terminarz");
  revalidatePath("/ranking");
}

export async function deletePredictionAction(fixtureId: string) {
  const user = await requireUser();
  requireUnlockedFixture(fixtureId);

  await deletePrediction(user.id, fixtureId);
  revalidatePath("/terminarz");
  revalidatePath("/ranking");
}
