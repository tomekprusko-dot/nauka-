"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import RequireAuth from "@/components/RequireAuth";
import * as store from "@/lib/store";
import { getTeam } from "@/data/teams";
import { Fixture, Prediction } from "@/lib/types";
import TeamBadge from "@/components/TeamBadge";

function formatKickoff(iso: string) {
  return new Date(iso).toLocaleString("pl-PL", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function FixtureRow({
  fixture,
  prediction,
  onSave,
}: {
  fixture: Fixture;
  prediction: Prediction | undefined;
  onSave: (home: number, away: number) => void;
}) {
  const home = getTeam(fixture.homeTeamId);
  const away = getTeam(fixture.awayTeamId);

  const [homeGoals, setHomeGoals] = useState(prediction?.homeGoals ?? "");
  const [awayGoals, setAwayGoals] = useState(prediction?.awayGoals ?? "");
  const [saved, setSaved] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    setHomeGoals(prediction?.homeGoals ?? "");
    setAwayGoals(prediction?.awayGoals ?? "");
  }, [prediction]);

  useEffect(() => {
    setLocked(new Date(fixture.kickoff).getTime() <= Date.now());
  }, [fixture.kickoff]);

  function handleSave() {
    if (homeGoals === "" || awayGoals === "") return;
    onSave(Number(homeGoals), Number(awayGoals));
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  }

  const hasPrediction = prediction !== undefined;

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border bg-white/5 p-4 transition-colors sm:flex-row sm:items-center sm:justify-between ${
        hasPrediction ? "border-[#f4c542]/30" : "border-white/10"
      }`}
    >
      <div className="flex flex-1 items-center gap-2">
        <TeamBadge team={home} />
        <p className="font-medium">
          {home?.name ?? fixture.homeTeamId}
          <span className="mx-1.5 text-zinc-500" aria-hidden>
            ⚽
          </span>
          {away?.name ?? fixture.awayTeamId}
        </p>
        <TeamBadge team={away} />
      </div>

      <div className="flex flex-col gap-1.5 sm:items-end">
        <p className="flex items-center gap-1 text-xs text-zinc-400">
          <span aria-hidden>🕐</span>
          {formatKickoff(fixture.kickoff)}
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={20}
            disabled={locked}
            value={homeGoals}
            onChange={(e) => setHomeGoals(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-14 rounded-lg border border-white/15 bg-black/30 px-2 py-1.5 text-center text-sm outline-none focus:border-[#f4c542] disabled:opacity-40"
          />
          <span className="text-zinc-500">:</span>
          <input
            type="number"
            min={0}
            max={20}
            disabled={locked}
            value={awayGoals}
            onChange={(e) => setAwayGoals(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-14 rounded-lg border border-white/15 bg-black/30 px-2 py-1.5 text-center text-sm outline-none focus:border-[#f4c542] disabled:opacity-40"
          />
          {!locked ? (
            <button
              onClick={handleSave}
              className="ml-2 rounded-lg bg-gradient-to-b from-[#ffe27a] to-[#c9922a] px-3 py-1.5 text-xs font-bold text-[#1b1200] transition-transform hover:scale-105 active:scale-95"
            >
              {saved ? "Zapisano ✓" : "Zapisz"}
            </button>
          ) : (
            <span className="ml-2 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-zinc-400">
              🔒 Zablokowane
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function TerminarzContent() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const fixtures = useMemo(() => store.getFixtures(), []);

  useEffect(() => {
    if (user) setPredictions(store.getUserPredictions(user.id));
  }, [user]);

  const byMatchday = useMemo(() => {
    const map = new Map<number, Fixture[]>();
    for (const fixture of fixtures) {
      const list = map.get(fixture.matchday) ?? [];
      list.push(fixture);
      map.set(fixture.matchday, list);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [fixtures]);

  function handleSave(fixtureId: string, home: number, away: number) {
    if (!user) return;
    store.savePrediction(user.id, fixtureId, home, away);
    setPredictions(store.getUserPredictions(user.id));
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display gold-text text-3xl">Terminarz i typy</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Wpisz przewidywany wynik przed rozpoczęciem meczu. Po jego starcie typ jest
          zablokowany.
        </p>
        <p className="mt-2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-300">
          Terminarz poniżej to dane przykładowe — prawdziwe pary meczów fazy ligowej LM
          2026/27 poznamy po losowaniu 27 sierpnia 2026.
        </p>
      </div>

      {byMatchday.map(([matchday, list]) => (
        <div key={matchday} className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-400">
            <span aria-hidden>🏆</span>
            Kolejka {matchday}
          </h2>
          <div className="space-y-2">
            {list.map((fixture) => (
              <FixtureRow
                key={fixture.id}
                fixture={fixture}
                prediction={predictions[fixture.id]}
                onSave={(home, away) => handleSave(fixture.id, home, away)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TerminarzPage() {
  return (
    <RequireAuth>
      <TerminarzContent />
    </RequireAuth>
  );
}
