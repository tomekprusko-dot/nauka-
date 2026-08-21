import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { getUserById } from "@/lib/db";
import type { InvitedUser } from "@/lib/types";

/**
 * Cached per-request: every Server Component/Action on the same request
 * that calls this gets the same result without hitting the database twice.
 */
export const getCurrentUser = cache(async (): Promise<InvitedUser | null> => {
  const userId = await getSessionUserId();
  if (!userId) return null;
  return getUserById(userId);
});

export async function requireUser(): Promise<InvitedUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<InvitedUser> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/terminarz");
  return user;
}
