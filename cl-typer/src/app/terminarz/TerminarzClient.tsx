"use client";

import { useEffect, useMemo, useState } from "react";
import { getTeam } from "@/data/teams";
import { Fixture, FixtureResult, MatchOutcome, Prediction } from "@/lib/types";
import TeamBadge from "@/components/TeamBadge";
import { scorePrediction } from "@/lib/scoring";
import { savePredictionAction } from "./actions";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pl-PL", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PointsBadge({ prediction, result }: { prediction: Prediction; result: FixtureResult }) {
  const score = scorePrediction(prediction, result);
  const style =
    score > 0
      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
      : "border-white/15 bg-white/5 text-zinc-400";
  return (
    <span className={`ml-2 rounded-full border px-2 py-0.5 text-xs font-bold ${style}`}>
      {score > 0 ? `+${score} pkt` : "0 pkt"}
    </span>
  );
}

const OUTCOME_LABEL: Record<MatchOutcome, string> = { H: "1", D: "X", A: "2" };

function OutcomePicker({
  homeName,
  awayName,
  value,
  disabled,
  onChange,
}: {
  homeName: string;
  awayName: string;
  value: MatchOutcome | null;
  disabled: boolean;
  onChange: (outcome: MatchOutcome) => void;
}) {
  const options: { outcome: MatchOutcome; title: string }[] = [
    { outcome: "H", title: `Wygrana: ${homeName}` },
    { outcome: "D", title: "Remis" },
    { outcome: "A", title: `Wygrana: ${awayName}` },
  ];
  return (
    <div className="flex items-center gap-1.5">
      {options.map(({ outcome, title }) => (
        <button
          key={outcome}
          type="button"
          title={title}
          disabled={disabled}
          onClick={() => onChange(outcome)}
          className={`h-9 w-9 rounded-lg border text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
            value === outcome
              ? "border-[#dc2626] bg-[#dc2626]/20 text-white"
              : "border-white/15 bg-black/30 text-zinc-300 hover:border-white/30"
          }`}
        >
          {OUTCOME_LABEL[outcome]}
        </button>
      ))}
    </div>
  );
}

function FixtureRow({
  fixture,
  prediction,
  result,
  onSaved,
}: {
  fixture: Fixture;
  prediction: Prediction | undefined;
  result: FixtureResult | undefined;
  onSaved: (fixtureId: string, outcome: MatchOutcome) => void;
}) {
  const home = getTeam(fixture.homeTeamId);
  const away = getTeam(fixture.awayTeamId);

  const [outcome, setOutcome] = useState<MatchOutcome | null>(prediction?.outcome ?? null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    setOutcome(prediction?.outcome ?? null);
  }, [prediction]);

  useEffect(() => {
    setLocked(new Date(fixture.kickoff).getTime() <= Date.now());
  }, [fixture.kickoff]);

  async function handleSave() {
    if (!outcome) return;
    setError(null);
    setSaving(true);
    try {
      await savePredictionAction(fixture.id, outcome);
      onSaved(fixture.id, outcome);
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nie udało się zapisać typu.");
    } finally {
      setSaving(false);
    }
  }

  const hasPrediction = prediction !== undefined;

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border bg-white/5 p-4 transition-colors sm:flex-row sm:items-center sm:justify-between ${
        hasPrediction ? "border-[#dc2626]/30" : "border-white/10"
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
        <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/20 px-2.5 py-1 text-xs">
          <span aria-hidden>📅</span>
          <span className="capitalize text-zinc-200">{formatDate(fixture.kickoff)}</span>
          <span className="text-zinc-500">•</span>
          <span aria-hidden>🕐</span>
          <span className="font-semibold text-[#dc2626]">{formatTime(fixture.kickoff)}</span>
        </div>
        <div className="flex items-center gap-2">
          {!locked ? (
            <>
              <OutcomePicker
                homeName={home?.shortName ?? fixture.homeTeamId}
                awayName={away?.shortName ?? fixture.awayTeamId}
                value={outcome}
                disabled={saving}
                onChange={setOutcome}
              />
              <button
                onClick={handleSave}
                disabled={saving || !outcome}
                className="ml-1 rounded-lg bg-gradient-to-b from-[#f87171] to-[#991b1b] px-3 py-1.5 text-xs font-bold text-white transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saved ? "Zapisano ✓" : saving ? "Zapisywanie..." : "Zapisz"}
              </button>
            </>
          ) : result ? (
            <span className="flex items-center rounded-lg border border-white/15 px-3 py-1.5 text-xs text-zinc-300">
              Wynik: <strong className="ml-1">{result.homeGoals}:{result.awayGoals}</strong>
              {prediction && <PointsBadge prediction={prediction} result={result} />}
            </span>
          ) : (
            <span className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-zinc-400">
              🔒 {prediction ? `Twój typ: ${OUTCOME_LABEL[prediction.outcome]}` : "Zablokowane"}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    </div>
  );
}

export default function TerminarzClient({
  fixtures,
  initialPredictions,
  results,
  myPoints,
  myRank,
  hotStreak,
}: {
  fixtures: Fixture[];
  initialPredictions: Record<string, Prediction>;
  results: Record<string, FixtureResult>;
  myPoints: number;
  myRank: number | null;
  hotStreak: number;
}) {
  const [predictions, setPredictions] = useState(initialPredictions);
  const [currentMatchday, setCurrentMatchday] = useState<number | null>(null);

  useEffect(() => {
    const now = Date.now();
    // Fixtures aren't guaranteed to be in chronological order (postponed
    // matches keep their original matchday but move to a later date), so
    // find the earliest future kickoff rather than the first array match.
    const upcoming = fixtures
      .filter((f) => new Date(f.kickoff).getTime() > now)
      .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())[0];
    setCurrentMatchday(upcoming ? upcoming.matchday : (fixtures[fixtures.length - 1]?.matchday ?? null));
  }, [fixtures]);

  function handleSaved(fixtureId: string, outcome: MatchOutcome) {
    setPredictions((prev) => ({
      ...prev,
      [fixtureId]: { userId: "", fixtureId, outcome, savedAt: new Date().toISOString() },
    }));
  }

  const byMatchday = useMemo(() => {
    const map = new Map<number, Fixture[]>();
    for (const fixture of fixtures) {
      const list = map.get(fixture.matchday) ?? [];
      list.push(fixture);
      map.set(fixture.matchday, list);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [fixtures]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display gold-text text-3xl">Terminarz i typy</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Wytypuj zwycięzcę (1), remis (X) albo wygraną gości (2) przed rozpoczęciem meczu.
          Po jego starcie typ jest zablokowany.
        </p>
        <p className="mt-2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-300">
          Kolejki 1-5 to prawdziwe wyniki sezonu 2026/27, kolejki 6-7 to prawdziwy
          terminarz do wytypowania (wyniki dojdą po rozegraniu). Kolejka 8 i dalsze są
          na razie przykładowe, do podmiany na pełny oficjalny terminarz
          PZPN/Ekstraklasa.org.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[#dc2626]/30 bg-[#dc2626]/10 px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-400">🏟️ Twoja kolejka</p>
          <p className="font-display text-2xl text-white">
            {currentMatchday !== null ? `Kolejka ${currentMatchday}` : "…"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-400">Twoje punkty</p>
          <p className="font-display text-2xl text-white">{myPoints} pkt</p>
        </div>
        {myRank !== null && (
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-400">Tabela typerów</p>
            <p className="font-display text-2xl text-white">#{myRank}</p>
          </div>
        )}
        {hotStreak >= 3 && (
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-400">Seria</p>
            <p className="font-display text-2xl text-white">🔥 {hotStreak}</p>
          </div>
        )}
      </div>

      {byMatchday.map(([matchday, list]) => (
        <div key={matchday} className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-400">
            <span aria-hidden>⚽</span>
            Kolejka {matchday}
            {matchday === currentMatchday && (
              <span className="rounded-full bg-[#dc2626]/20 px-2 py-0.5 text-[10px] font-bold text-[#dc2626]">
                Twoja kolejka
              </span>
            )}
          </h2>
          <div className="space-y-2">
            {list.map((fixture) => (
              <FixtureRow
                key={fixture.id}
                fixture={fixture}
                prediction={predictions[fixture.id]}
                result={results[fixture.id]}
                onSaved={handleSaved}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
