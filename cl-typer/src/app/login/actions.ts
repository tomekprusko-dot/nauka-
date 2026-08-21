"use server";

import { redirect } from "next/navigation";
import { findUserByCredentials } from "@/lib/db";
import { createSession, clearSession } from "@/lib/session";

export interface LoginState {
  error?: string;
}

export async function loginAction(_prevState: LoginState | undefined, formData: FormData): Promise<LoginState> {
  const nameOrEmail = String(formData.get("nameOrEmail") ?? "").trim();
  const accessCode = String(formData.get("accessCode") ?? "").trim();

  if (!nameOrEmail || !accessCode) {
    return { error: "Podaj imię/e-mail i kod dostępu." };
  }

  const user = await findUserByCredentials(nameOrEmail, accessCode);
  if (!user) {
    return { error: "Nie znaleziono takiej osoby albo kod dostępu jest błędny." };
  }

  await createSession(user.id);
  redirect("/terminarz");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
