"use client";

import { useEffect, useState } from "react";
import { teams, getTeam } from "@/data/teams";
import TeamBadge from "@/components/TeamBadge";
import { SpecialPrediction, SpecialResult } from "@/lib/types";
import { POINTS_SPECIAL } from "@/lib/scoring";
import { saveSpecialPredictionAction } from "./actions";

function formatDeadline(iso: string) {
  return new Date(iso).toLocaleDateString("pl-PL", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function TypySpecjalneClient({
  deadline,
  initialPrediction,
  result,
}: {
  deadline: string;
  initialPrediction: SpecialPrediction | null;
  result: SpecialResult;
}) {
  const [saved, setSaved] = useState<SpecialPrediction | null>(initialPrediction);
  const [locked, setLocked] = useState(false);
  const [championTeamId, setChampionTeamId] = useState<string | null>(initialPrediction?.championTeamId ?? null);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocked(new Date(deadline).getTime() <= Date.now());
  }, [deadline]);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      await saveSpecialPredictionAction(championTeamId);
      setSaved({ userId: "", championTeamId, savedAt: new Date().toISOString() });
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nie udało się zapisać typu.");
    } finally {
      setSaving(false);
    }
  }

  const championResolved = Boolean(result.championTeamId);
  const championHit = championResolved && saved?.championTeamId === result.championTeamId;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display gold-text text-3xl">Wytypuj mistrza</h1>
        <p className="mt-1 text-sm text-zinc-400">Jednorazowy typ na cały sezon.</p>
        <p className="mt-2 flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-300">
          <span aria-hidden>🔒</span>
          Typ można zmieniać do{" "}
          <span className="capitalize">{formatDeadline(deadline)}</span>. Potem jest
          zablokowany do końca sezonu.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h2 className="flex items-center gap-2 font-semibold text-white">
          <span aria-hidden>🏆</span>
          Mistrz Polski
          <span className="ml-auto rounded-full bg-[#dc2626]/15 px-2 py-0.5 text-xs font-bold text-[#dc2626]">
            +{POINTS_SPECIAL} pkt
          </span>
        </h2>
        <p className="mt-1 text-sm text-zinc-400">Która drużyna wygra całe rozgrywki?</p>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => {
            const selected = championTeamId === team.id;
            return (
              <button
                key={team.id}
                type="button"
                disabled={locked || saving}
                onClick={() => setChampionTeamId(team.id)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  selected
                    ? "border-[#dc2626] bg-[#dc2626]/10"
                    : "border-white/10 bg-black/20 hover:border-white/25"
                }`}
              >
                <TeamBadge team={team} size="sm" />
                <span className="truncate">{team.name}</span>
              </button>
            );
          })}
        </div>

        {championResolved && saved && (
          <p className={`mt-3 text-sm ${championHit ? "text-emerald-400" : "text-zinc-400"}`}>
            {championHit ? "✅ Trafiony typ!" : "❌ Niestety, chybiony typ."} Mistrzem został{" "}
            <strong>{getTeam(result.championTeamId ?? "")?.name ?? result.championTeamId}</strong>.
          </p>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {!locked ? (
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-lg bg-gradient-to-b from-[#f87171] to-[#991b1b] px-4 py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 sm:w-auto"
        >
          {saving ? "Zapisywanie..." : justSaved ? "Zapisano ✓" : "Zapisz typ mistrza"}
        </button>
      ) : (
        <p className="text-sm text-zinc-400">🔒 Termin minął — typ jest zablokowany.</p>
      )}
    </div>
  );
}
