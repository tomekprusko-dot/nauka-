"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { saveSpecialPrediction } from "@/lib/db";
import { getTournamentStart } from "@/data/fixtures";

export async function saveSpecialPredictionAction(championTeamId: string | null) {
  const user = await requireUser();

  if (new Date(getTournamentStart()).getTime() <= Date.now()) {
    throw new Error("Sezon się rozpoczął — typ mistrza jest zablokowany.");
  }

  await saveSpecialPrediction(user.id, championTeamId);
  revalidatePath("/typy-specjalne");
  revalidatePath("/ranking");
}
