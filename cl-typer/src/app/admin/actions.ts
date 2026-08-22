"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { addUser, removeUser, setResult, setSpecialResult } from "@/lib/db";
import { fixtures } from "@/data/fixtures";

export async function addUserAction(name: string, accessCode: string) {
  await requireAdmin();
  if (!name.trim() || !accessCode.trim()) {
    throw new Error("Uzupełnij imię i kod dostępu.");
  }
  await addUser({ name: name.trim(), email: null, accessCode: accessCode.trim(), role: "user" });
  revalidatePath("/admin");
}

export async function removeUserAction(userId: string) {
  await requireAdmin();
  await removeUser(userId);
  revalidatePath("/admin");
}

export async function setResultAction(fixtureId: string, homeGoals: number, awayGoals: number) {
  await requireAdmin();
  if (!fixtures.some((f) => f.id === fixtureId)) {
    throw new Error("Nieznany mecz.");
  }
  if (!Number.isInteger(homeGoals) || !Number.isInteger(awayGoals) || homeGoals < 0 || awayGoals < 0) {
    throw new Error("Nieprawidłowy wynik.");
  }
  await setResult(fixtureId, homeGoals, awayGoals);
  revalidatePath("/admin");
  revalidatePath("/ranking");
}

export async function setSpecialResultAction(championTeamId: string | null, topScorer: string | null) {
  await requireAdmin();
  await setSpecialResult(championTeamId, topScorer);
  revalidatePath("/admin");
  revalidatePath("/ranking");
  revalidatePath("/typy-specjalne");
}
