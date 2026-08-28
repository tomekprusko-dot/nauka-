"use client";

import { FormEvent, useState } from "react";
import { getTeam, teams } from "@/data/teams";
import TeamBadge from "@/components/TeamBadge";
import { Fixture, FixtureResult, InvitedUser, SpecialResult, Team } from "@/lib/types";
import { addUserAction, removeUserAction, setResultAction, setSpecialResultAction } from "./actions";

function UsersSection({ initialUsers }: { initialUsers: InvitedUser[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [name, setName] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!name || !accessCode) return;
    setError(null);
    setPending(true);
    try {
      await addUserAction(name, accessCode);
      setUsers((prev) => [
        ...prev,
        { id: `pending-${Date.now()}`, name, email: null, accessCode, role: "user" },
      ]);
      setName("");
      setAccessCode("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nie udało się dodać osoby.");
    } finally {
      setPending(false);
    }
  }

  async function handleRemove(id: string) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    try {
      await removeUserAction(id);
    } catch {
      setUsers(initialUsers);
    }
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
              <p className="text-xs text-zinc-400">kod: {u.accessCode}</p>
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
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
          placeholder="Kod dostępu"
          className="min-w-[120px] flex-1 rounded-lg border border-white/15 bg-black/30 px-3 py-1.5 text-sm outline-none focus:border-[#3d5afe]"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#3d5afe] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#2f47d1] disabled:opacity-60"
        >
          {pending ? "Dodawanie..." : "Dodaj"}
        </button>
      </form>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </section>
  );
}

function ResultRow({
  fixture,
  home,
  away,
  initialResult,
  onSaved,
}: {
  fixture: Fixture;
  home: Team | undefined;
  away: Team | undefined;
  initialResult: FixtureResult | undefined;
  onSaved: (fixtureId: string, home: number, away: number) => void;
}) {
  const [homeGoals, setHomeGoals] = useState(initialResult?.homeGoals?.toString() ?? "");
  const [awayGoals, setAwayGoals] = useState(initialResult?.awayGoals?.toString() ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (homeGoals === "" || awayGoals === "") return;
    setPending(true);
    setError(null);
    try {
      await setResultAction(fixture.id, Number(homeGoals), Number(awayGoals));
      onSaved(fixture.id, Number(homeGoals), Number(awayGoals));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nie udało się zapisać wyniku.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-center gap-2 text-sm">
        <TeamBadge team={home} size="sm" />
        {home?.name ?? fixture.homeTeamId}
        <span className="text-zinc-500">–</span>
        {away?.name ?? fixture.awayTeamId}
        <TeamBadge team={away} size="sm" />
      </p>
      <div className="flex items-center gap-2">
        <input
          value={homeGoals}
          onChange={(e) => setHomeGoals(e.target.value)}
          type="number"
          min={0}
          className="w-14 rounded-lg border border-white/15 bg-black/30 px-2 py-1 text-center text-sm outline-none focus:border-[#dc2626]"
        />
        <span className="text-zinc-500">:</span>
        <input
          value={awayGoals}
          onChange={(e) => setAwayGoals(e.target.value)}
          type="number"
          min={0}
          className="w-14 rounded-lg border border-white/15 bg-black/30 px-2 py-1 text-center text-sm outline-none focus:border-[#dc2626]"
        />
        <button
          onClick={handleSave}
          disabled={pending}
          className="rounded-lg bg-gradient-to-b from-[#f87171] to-[#991b1b] px-3 py-1.5 text-xs font-bold text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-60"
        >
          {pending ? "Zapisywanie..." : "Zapisz"}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function ResultsSection({
  fixtures,
  initialResults,
}: {
  fixtures: Fixture[];
  initialResults: Record<string, FixtureResult>;
}) {
  const [results, setResults] = useState(initialResults);

  function handleSaved(fixtureId: string, home: number, away: number) {
    setResults((prev) => ({ ...prev, [fixtureId]: { fixtureId, homeGoals: home, awayGoals: away } }));
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
        {fixtures.map((fixture) => (
          <ResultRow
            key={fixture.id}
            fixture={fixture}
            home={getTeam(fixture.homeTeamId)}
            away={getTeam(fixture.awayTeamId)}
            initialResult={results[fixture.id]}
            onSaved={handleSaved}
          />
        ))}
      </div>
    </section>
  );
}

function SpecialResultSection({ initialResult }: { initialResult: SpecialResult }) {
  const [championTeamId, setChampionTeamId] = useState(initialResult.championTeamId ?? "");
  const [saved, setSaved] = useState(initialResult);
  const [pending, setPending] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const championId = championTeamId || null;
      await setSpecialResultAction(championId);
      setSaved({ championTeamId: championId });
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nie udało się zapisać.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
        Wynik specjalny (koniec sezonu)
      </h2>
      <p className="text-xs text-zinc-500">
        Wpisz, gdy będzie znany — automatycznie doliczy po 10 pkt każdej osobie z trafionym typem.
      </p>
      <form
        onSubmit={handleSave}
        className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1 space-y-1">
          <label className="text-xs text-zinc-400">🏆 Mistrz Polski</label>
          <select
            value={championTeamId}
            onChange={(e) => setChampionTeamId(e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-1.5 text-sm outline-none focus:border-[#dc2626]"
          >
            <option value="">— nie ustawiono —</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-gradient-to-b from-[#f87171] to-[#991b1b] px-4 py-1.5 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-60"
        >
          {pending ? "Zapisywanie..." : justSaved ? "Zapisano ✓" : "Zapisz"}
        </button>
      </form>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {saved.championTeamId && (
        <p className="text-xs text-zinc-500">Aktualnie ustawione: {getTeam(saved.championTeamId)?.name}</p>
      )}
    </section>
  );
}

export default function AdminClient({
  initialUsers,
  fixtures,
  initialResults,
  initialSpecialResult,
}: {
  initialUsers: InvitedUser[];
  fixtures: Fixture[];
  initialResults: Record<string, FixtureResult>;
  initialSpecialResult: SpecialResult;
}) {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display gold-text text-3xl">Panel administratora</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Zarządzaj dostępem osób oraz wpisuj wyniki meczów.
        </p>
      </div>
      <UsersSection initialUsers={initialUsers} />
      <ResultsSection fixtures={fixtures} initialResults={initialResults} />
      <SpecialResultSection initialResult={initialSpecialResult} />
    </div>
  );
}
