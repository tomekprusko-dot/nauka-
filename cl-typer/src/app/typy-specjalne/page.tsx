"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import RequireAuth from "@/components/RequireAuth";
import * as store from "@/lib/store";
import { teams, getTeam } from "@/data/teams";
import TeamBadge from "@/components/TeamBadge";
import { SpecialPrediction, SpecialResult } from "@/lib/types";
import { POINTS_SPECIAL } from "@/lib/scoring";

function formatDeadline(iso: string) {
  return new Date(iso).toLocaleDateString("pl-PL", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function TypySpecjalneContent() {
  const { user } = useAuth();
  const [saved, setSaved] = useState<SpecialPrediction | null>(null);
  const [result, setResult] = useState<SpecialResult>({ championTeamId: null, topScorer: null });
  const [locked, setLocked] = useState(false);
  const [championTeamId, setChampionTeamId] = useState<string | null>(null);
  const [topScorer, setTopScorer] = useState("");
  const [justSaved, setJustSaved] = useState(false);

  const tournamentStart = store.getTournamentStart();

  useEffect(() => {
    if (!user) return;
    const existing = store.getUserSpecialPrediction(user.id);
    setSaved(existing);
    setChampionTeamId(existing?.championTeamId ?? null);
    setTopScorer(existing?.topScorer ?? "");
    setResult(store.getSpecialResult());
  }, [user]);

  useEffect(() => {
    setLocked(new Date(tournamentStart).getTime() <= Date.now());
  }, [tournamentStart]);

  function handleSave() {
    if (!user) return;
    store.saveSpecialPrediction(user.id, championTeamId, topScorer.trim() || null);
    setSaved(store.getUserSpecialPrediction(user.id));
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1200);
  }

  const championResolved = Boolean(result.championTeamId);
  const championHit = championResolved && saved?.championTeamId === result.championTeamId;
  const topScorerResolved = Boolean(result.topScorer);
  const topScorerHit =
    topScorerResolved &&
    saved?.topScorer?.trim().toLowerCase() === result.topScorer?.trim().toLowerCase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display gold-text text-3xl">Typy specjalne</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Jednorazowe typy na cały sezon — wytypuj je przed startem rozgrywek.
        </p>
        <p className="mt-2 flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-300">
          <span aria-hidden>🔒</span>
          Typy można zmieniać do rozpoczęcia pierwszego meczu fazy ligowej —{" "}
          <span className="capitalize">{formatDeadline(tournamentStart)}</span>. Potem są
          zablokowane do końca sezonu.
        </p>
      </div>

      {/* Champion pick */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h2 className="flex items-center gap-2 font-semibold text-white">
          <span aria-hidden>🏆</span>
          Zwycięzca Ligi Mistrzów
          <span className="ml-auto rounded-full bg-[#f4c542]/15 px-2 py-0.5 text-xs font-bold text-[#f4c542]">
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
                disabled={locked}
                onClick={() => setChampionTeamId(team.id)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  selected
                    ? "border-[#f4c542] bg-[#f4c542]/10"
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
          <p
            className={`mt-3 text-sm ${championHit ? "text-emerald-400" : "text-zinc-400"}`}
          >
            {championHit ? "✅ Trafiony typ!" : "❌ Niestety, chybiony typ."} Mistrzem został{" "}
            <strong>{getTeam(result.championTeamId ?? "")?.name ?? result.championTeamId}</strong>.
          </p>
        )}
      </div>

      {/* Top scorer pick */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h2 className="flex items-center gap-2 font-semibold text-white">
          <span aria-hidden>👑</span>
          Król strzelców rozgrywek
          <span className="ml-auto rounded-full bg-[#f4c542]/15 px-2 py-0.5 text-xs font-bold text-[#f4c542]">
            +{POINTS_SPECIAL} pkt
          </span>
        </h2>
        <p className="mt-1 text-sm text-zinc-400">Kto strzeli najwięcej goli w tej edycji?</p>

        <input
          value={topScorer}
          onChange={(e) => setTopScorer(e.target.value)}
          disabled={locked}
          placeholder="np. Kylian Mbappé"
          className="mt-3 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[#f4c542] disabled:opacity-50"
        />

        {topScorerResolved && saved && (
          <p className={`mt-3 text-sm ${topScorerHit ? "text-emerald-400" : "text-zinc-400"}`}>
            {topScorerHit ? "✅ Trafiony typ!" : "❌ Niestety, chybiony typ."} Królem strzelców
            został <strong>{result.topScorer}</strong>.
          </p>
        )}
      </div>

      {!locked ? (
        <button
          onClick={handleSave}
          className="w-full rounded-lg bg-gradient-to-b from-[#ffe27a] to-[#c9922a] px-4 py-2.5 text-sm font-bold text-[#1b1200] transition-transform hover:scale-[1.01] active:scale-[0.99] sm:w-auto"
        >
          {justSaved ? "Zapisano ✓" : "Zapisz typy specjalne"}
        </button>
      ) : (
        <p className="text-sm text-zinc-400">
          🔒 Sezon się rozpoczął — typy specjalne są zablokowane.
        </p>
      )}
    </div>
  );
}

export default function TypySpecjalnePage() {
  return (
    <RequireAuth>
      <TypySpecjalneContent />
    </RequireAuth>
  );
}
