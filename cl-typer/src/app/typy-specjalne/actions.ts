"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { saveSpecialPrediction } from "@/lib/db";
import { SPECIAL_PICK_DEADLINE } from "@/data/fixtures";

export async function saveSpecialPredictionAction(championTeamId: string | null) {
  const user = await requireUser();

  if (new Date(SPECIAL_PICK_DEADLINE).getTime() <= Date.now()) {
    throw new Error("Termin minął — typ mistrza jest zablokowany.");
  }

  await saveSpecialPrediction(user.id, championTeamId);
  revalidatePath("/typy-specjalne");
  revalidatePath("/ranking");
}
