"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import * as store from "@/lib/store";
import { getTeam } from "@/data/teams";
import { FixtureResult, InvitedUser, Team } from "@/lib/types";
import TeamBadge from "@/components/TeamBadge";

function UsersSection() {
  const [users, setUsers] = useState<InvitedUser[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");

  useEffect(() => {
    setUsers(store.getUsers());
  }, []);

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!name || !email || !accessCode) return;
    store.addUser({ name, email, accessCode, role: "user" });
    setUsers(store.getUsers());
    setName("");
    setEmail("");
    setAccessCode("");
  }

  function handleRemove(id: string) {
    store.removeUser(id);
    setUsers(store.getUsers());
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
        Zaproszone osoby
      </h2>

      <div className="space-y-2">
        {users.map((u) => (
          <div
            key={u.id}
            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          >
            <div>
              <p className="font-medium">
                {u.name} {u.role === "admin" && <span className="text-xs text-amber-400">(admin)</span>}
              </p>
              <p className="text-xs text-zinc-400">
                {u.email} · kod: {u.accessCode}
              </p>
            </div>
            {u.role !== "admin" && (
              <button
                onClick={() => handleRemove(u.id)}
                className="rounded-lg border border-white/15 px-2 py-1 text-xs text-zinc-300 hover:bg-white/10"
              >
                Usuń
              </button>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="flex flex-wrap gap-2 rounded-lg border border-white/10 bg-white/5 p-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Imię"
          className="min-w-[120px] flex-1 rounded-lg border border-white/15 bg-black/30 px-3 py-1.5 text-sm outline-none focus:border-[#3d5afe]"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          className="min-w-[160px] flex-1 rounded-lg border border-white/15 bg-black/30 px-3 py-1.5 text-sm outline-none focus:border-[#3d5afe]"
        />
        <input
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
          placeholder="Kod dostępu"
          className="min-w-[120px] flex-1 rounded-lg border border-white/15 bg-black/30 px-3 py-1.5 text-sm outline-none focus:border-[#3d5afe]"
        />
        <button
          type="submit"
          className="rounded-lg bg-[#3d5afe] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#2f47d1]"
        >
          Dodaj
        </button>
      </form>
    </section>
  );
}

function ResultsSection() {
  const fixtures = useMemo(() => store.getFixtures(), []);
  const [results, setResults] = useState<Record<string, FixtureResult>>({});

  useEffect(() => {
    setResults(store.getResults());
  }, []);

  function handleSave(fixtureId: string, home: string, away: string) {
    if (home === "" || away === "") return;
    store.setResult(fixtureId, Number(home), Number(away));
    setResults(store.getResults());
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
        Wyniki meczów
      </h2>
      <p className="text-xs text-zinc-500">
        Wpisz ostateczny wynik po zakończeniu meczu — na tej podstawie liczony jest ranking.
      </p>
      <div className="space-y-2">
        {fixtures.map((fixture) => {
          const home = getTeam(fixture.homeTeamId);
          const away = getTeam(fixture.awayTeamId);
          const result = results[fixture.id];
          return (
            <ResultRow
              key={fixture.id}
              home={home}
              away={away}
              homeFallback={fixture.homeTeamId}
              awayFallback={fixture.awayTeamId}
              result={result}
              onSave={(h, a) => handleSave(fixture.id, h, a)}
            />
          );
        })}
      </div>
    </section>
  );
}

function ResultRow({
  home,
  away,
  homeFallback,
  awayFallback,
  result,
  onSave,
}: {
  home: Team | undefined;
  away: Team | undefined;
  homeFallback: string;
  awayFallback: string;
  result: FixtureResult | undefined;
  onSave: (home: string, away: string) => void;
}) {
  const [homeGoals, setHomeGoals] = useState(result?.homeGoals?.toString() ?? "");
  const [awayGoals, setAwayGoals] = useState(result?.awayGoals?.toString() ?? "");

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-center gap-2 text-sm">
        <TeamBadge team={home} size="sm" />
        {home?.name ?? homeFallback}
        <span className="text-zinc-500">–</span>
        {away?.name ?? awayFallback}
        <TeamBadge team={away} size="sm" />
      </p>
      <div className="flex items-center gap-2">
        <input
          value={homeGoals}
          onChange={(e) => setHomeGoals(e.target.value)}
          type="number"
          min={0}
          className="w-14 rounded-lg border border-white/15 bg-black/30 px-2 py-1 text-center text-sm outline-none focus:border-[#f4c542]"
        />
        <span className="text-zinc-500">:</span>
        <input
          value={awayGoals}
          onChange={(e) => setAwayGoals(e.target.value)}
          type="number"
          min={0}
          className="w-14 rounded-lg border border-white/15 bg-black/30 px-2 py-1 text-center text-sm outline-none focus:border-[#f4c542]"
        />
        <button
          onClick={() => onSave(homeGoals, awayGoals)}
          className="rounded-lg bg-gradient-to-b from-[#ffe27a] to-[#c9922a] px-3 py-1.5 text-xs font-bold text-[#1b1200] transition-transform hover:scale-105 active:scale-95"
        >
          Zapisz
        </button>
      </div>
    </div>
  );
}

function AdminContent() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display gold-text text-3xl">Panel administratora</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Zarządzaj dostępem osób oraz wpisuj wyniki meczów.
        </p>
      </div>
      <UsersSection />
      <ResultsSection />
    </div>
  );
}

export default function AdminPage() {
  return (
    <RequireAuth adminOnly>
      <AdminContent />
    </RequireAuth>
  );
}
