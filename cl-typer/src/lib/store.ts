"use client";

import { seedUsers } from "@/data/users";
import { fixtures } from "@/data/fixtures";
import { FixtureResult, InvitedUser, Prediction, StandingsRow } from "@/lib/types";
import { scorePrediction } from "@/lib/scoring";

/**
 * Tymczasowa "baza danych" oparta o localStorage przeglądarki.
 * To etap "sam frontend" — dane żyją tylko lokalnie u każdego użytkownika
 * i nie są współdzielone między urządzeniami. Gdy podepniemy Supabase,
 * te same funkcje zostaną podmienione na zapytania do bazy, a reszta
 * aplikacji (komponenty) nie będzie musiała się zmienić.
 */

const KEYS = {
  users: "cl-typer:users",
  session: "cl-typer:session",
  results: "cl-typer:results",
  predictions: "cl-typer:predictions",
} as const;

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function ensureUsersSeeded(): InvitedUser[] {
  const existing = readJSON<InvitedUser[] | null>(KEYS.users, null);
  if (existing) return existing;
  writeJSON(KEYS.users, seedUsers);
  return seedUsers;
}

export function getUsers(): InvitedUser[] {
  return ensureUsersSeeded();
}

export function addUser(user: Omit<InvitedUser, "id">): InvitedUser {
  const users = ensureUsersSeeded();
  const newUser: InvitedUser = { ...user, id: `u-${Date.now()}` };
  const updated = [...users, newUser];
  writeJSON(KEYS.users, updated);
  return newUser;
}

export function removeUser(userId: string) {
  const users = ensureUsersSeeded();
  writeJSON(
    KEYS.users,
    users.filter((u) => u.id !== userId),
  );
}

export function login(nameOrEmail: string, accessCode: string): InvitedUser | null {
  const users = ensureUsersSeeded();
  const needle = nameOrEmail.trim().toLowerCase();
  const match = users.find(
    (u) =>
      (u.name.toLowerCase() === needle || u.email.toLowerCase() === needle) &&
      u.accessCode.toLowerCase() === accessCode.trim().toLowerCase(),
  );
  if (match) {
    writeJSON(KEYS.session, match.id);
  }
  return match ?? null;
}

export function logout() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEYS.session);
}

export function getCurrentUser(): InvitedUser | null {
  const sessionId = readJSON<string | null>(KEYS.session, null);
  if (!sessionId) return null;
  const users = ensureUsersSeeded();
  return users.find((u) => u.id === sessionId) ?? null;
}

export function getFixtures() {
  return fixtures;
}

export function getResults(): Record<string, FixtureResult> {
  return readJSON<Record<string, FixtureResult>>(KEYS.results, {});
}

export function setResult(fixtureId: string, homeGoals: number, awayGoals: number) {
  const results = getResults();
  results[fixtureId] = { fixtureId, homeGoals, awayGoals };
  writeJSON(KEYS.results, results);
}

export function clearResult(fixtureId: string) {
  const results = getResults();
  delete results[fixtureId];
  writeJSON(KEYS.results, results);
}

export function getAllPredictions(): Prediction[] {
  return readJSON<Prediction[]>(KEYS.predictions, []);
}

export function getUserPredictions(userId: string): Record<string, Prediction> {
  const all = getAllPredictions();
  const mine = all.filter((p) => p.userId === userId);
  return Object.fromEntries(mine.map((p) => [p.fixtureId, p]));
}

export function savePrediction(
  userId: string,
  fixtureId: string,
  homeGoals: number,
  awayGoals: number,
) {
  const all = getAllPredictions();
  const withoutThis = all.filter((p) => !(p.userId === userId && p.fixtureId === fixtureId));
  const next: Prediction = { userId, fixtureId, homeGoals, awayGoals, savedAt: new Date().toISOString() };
  writeJSON(KEYS.predictions, [...withoutThis, next]);
}

export function computeStandings(): StandingsRow[] {
  const users = ensureUsersSeeded();
  const results = getResults();
  const allPredictions = getAllPredictions();

  return users
    .map((user) => {
      const userPredictions = allPredictions.filter((p) => p.userId === user.id);
      let points = 0;
      let exactHits = 0;
      let outcomeHits = 0;

      for (const prediction of userPredictions) {
        const result = results[prediction.fixtureId];
        if (!result) continue;
        const score = scorePrediction(prediction, result);
        points += score;
        if (score === 3) exactHits += 1;
        else if (score === 1) outcomeHits += 1;
      }

      return {
        user,
        points,
        exactHits,
        outcomeHits,
        predictionsMade: userPredictions.length,
      };
    })
    .sort((a, b) => b.points - a.points || b.exactHits - a.exactHits);
}
