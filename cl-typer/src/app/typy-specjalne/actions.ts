"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { saveSpecialPrediction } from "@/lib/db";
import { getTournamentStart } from "@/data/fixtures";

export async function saveSpecialPredictionAction(championTeamId: string | null, topScorer: string | null) {
  const user = await requireUser();

  if (new Date(getTournamentStart()).getTime() <= Date.now()) {
    throw new Error("Sezon się rozpoczął — typy specjalne są zablokowane.");
  }

  await saveSpecialPrediction(user.id, championTeamId, topScorer);
  revalidatePath("/typy-specjalne");
  revalidatePath("/ranking");
}
