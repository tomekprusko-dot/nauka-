"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { savePrediction } from "@/lib/db";
import { fixtures } from "@/data/fixtures";

export async function savePredictionAction(fixtureId: string, homeGoals: number, awayGoals: number) {
  const user = await requireUser();

  const fixture = fixtures.find((f) => f.id === fixtureId);
  if (!fixture) {
    throw new Error("Nieznany mecz.");
  }
  if (new Date(fixture.kickoff).getTime() <= Date.now()) {
    throw new Error("Ten mecz już się rozpoczął — typ jest zablokowany.");
  }
  if (!Number.isInteger(homeGoals) || !Number.isInteger(awayGoals) || homeGoals < 0 || awayGoals < 0) {
    throw new Error("Nieprawidłowy wynik.");
  }

  await savePrediction(user.id, fixtureId, homeGoals, awayGoals);
  revalidatePath("/terminarz");
  revalidatePath("/ranking");
}
