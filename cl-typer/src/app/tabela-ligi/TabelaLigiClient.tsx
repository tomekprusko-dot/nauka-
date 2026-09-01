"use client";

import { Fragment, useState } from "react";
import { getTeam } from "@/data/teams";
import TeamBadge from "@/components/TeamBadge";
import { TeamDetail } from "@/lib/types";

const OUTCOME_STYLE: Record<"W" | "D" | "L", string> = {
  W: "border-emerald-400/40 bg-emerald-400/15 text-emerald-300",
  D: "border-white/15 bg-white/10 text-zinc-300",
  L: "border-red-400/40 bg-red-400/15 text-red-300",
};

function FormDot({ outcome }: { outcome: "W" | "D" | "L" }) {
  return (
    <span
      className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold ${OUTCOME_STYLE[outcome]}`}
    >
      {outcome}
    </span>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function TeamDetailPanel({ detail }: { detail: TeamDetail }) {
  const avg = detail.played > 0 ? (detail.goalsFor / detail.played).toFixed(2) : "—";
  const sentiment = detail.fanSentiment;

  return (
    <div className="space-y-4 border-t border-white/10 bg-black/10 px-4 py-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatBlock label="Pozycja" value={`#${detail.rank}`} />
        <StatBlock label="Punkty" value={`${detail.points} pkt`} />
        <StatBlock label="Strzelone gole" value={`${detail.goalsFor}`} />
        <StatBlock label="Stracone gole" value={`${detail.goalsAgainst}`} />
        <StatBlock label="Średnia bramek" value={`${avg}/mecz`} />
        <StatBlock
          label="Mecze domowe"
          value={`${detail.home.won}Z-${detail.home.drawn}R-${detail.home.lost}P (${detail.home.goalsFor}:${detail.home.goalsAgainst})`}
        />
        <StatBlock
          label="Mecze wyjazdowe"
          value={`${detail.away.won}Z-${detail.away.drawn}R-${detail.away.lost}P (${detail.away.goalsFor}:${detail.away.goalsAgainst})`}
        />
        <StatBlock label="Rozegrane mecze" value={`${detail.played}`} />
      </div>

      {detail.form.length > 0 && (
        <div>
          <p className="mb-1.5 text-[10px] uppercase tracking-wide text-zinc-500">Forma (ostatnie mecze)</p>
          <div className="flex gap-1.5">
            {detail.form.map((outcome, i) => (
              <FormDot key={i} outcome={outcome} />
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-fuchsia-400/30 bg-fuchsia-400/10 px-3 py-3">
        <p className="text-xs font-bold uppercase tracking-wide text-fuchsia-300">🗳️ Jak typują użytkownicy?</p>
        {sentiment ? (
          <>
            <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-white/10">
              <div className="bg-emerald-400" style={{ width: `${sentiment.winPct}%` }} title="Wygrana" />
              <div className="bg-zinc-400" style={{ width: `${sentiment.drawPct}%` }} title="Remis" />
              <div className="bg-red-400" style={{ width: `${sentiment.lossPct}%` }} title="Przegrana" />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-300">
              <span className="text-emerald-300">🟢 Wygrana — {sentiment.winPct}%</span>
              <span className="text-zinc-300">⚪ Remis — {sentiment.drawPct}%</span>
              <span className="text-red-300">🔴 Przegrana — {sentiment.lossPct}%</span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">
              Na podstawie {sentiment.totalPicks} {sentiment.totalPicks === 1 ? "typu" : "typów"} naszej ekipy.
            </p>
          </>
        ) : (
          <p className="mt-1.5 text-xs text-zinc-500">Jeszcze nikt nie typował meczu tej drużyny.</p>
        )}
      </div>

      {detail.matches.length > 0 && (
        <div>
          <p className="mb-1.5 text-[10px] uppercase tracking-wide text-zinc-500">
            Historia spotkań ({detail.matches.length})
          </p>
          <div className="space-y-1.5">
            {[...detail.matches].reverse().map((m) => {
              const opponent = getTeam(m.opponentId);
              return (
                <div
                  key={m.fixtureId}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs"
                >
                  <span className="flex items-center gap-1.5 text-zinc-300">
                    <span className="w-14 shrink-0 text-zinc-500">Kolejka {m.matchday}</span>
                    <span className="text-zinc-500">{m.isHome ? "vs" : "@"}</span>
                    <TeamBadge team={opponent} size="sm" />
                    <span className="truncate">{opponent?.name ?? m.opponentId}</span>
                  </span>
                  <span className="flex items-center gap-2 font-semibold">
                    <span className="text-zinc-300">
                      {m.goalsFor}:{m.goalsAgainst}
                    </span>
                    <FormDot outcome={m.outcome} />
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TabelaLigiClient({ details }: { details: TeamDetail[] }) {
  const [openTeamId, setOpenTeamId] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full min-w-[560px] text-sm">
        <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-zinc-400">
          <tr>
            <th className="px-3 py-3">#</th>
            <th className="px-3 py-3">Drużyna</th>
            <th className="px-3 py-3 text-right">M</th>
            <th className="px-3 py-3 text-right">Z</th>
            <th className="px-3 py-3 text-right">R</th>
            <th className="px-3 py-3 text-right">P</th>
            <th className="px-3 py-3 text-right">Bramki</th>
            <th className="px-3 py-3 text-right">+/-</th>
            <th className="px-3 py-3 text-right">Pkt</th>
          </tr>
        </thead>
        <tbody>
          {details.map((detail) => {
            const team = getTeam(detail.teamId);
            const isOpen = openTeamId === detail.teamId;
            return (
              <Fragment key={detail.teamId}>
                <tr
                  onClick={() => setOpenTeamId(isOpen ? null : detail.teamId)}
                  className={`cursor-pointer border-t border-white/10 transition-colors hover:bg-white/5 ${
                    isOpen ? "bg-white/5" : ""
                  }`}
                >
                  <td className="px-3 py-2.5 text-zinc-400">{detail.rank}</td>
                  <td className="px-3 py-2.5 font-medium">
                    <span className="flex items-center gap-2">
                      <span className={`text-zinc-500 transition-transform ${isOpen ? "rotate-90" : ""}`} aria-hidden>
                        ▶
                      </span>
                      <TeamBadge team={team} size="sm" />
                      <span className="truncate">{team?.name ?? detail.teamId}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right text-zinc-400">{detail.played}</td>
                  <td className="px-3 py-2.5 text-right text-zinc-400">{detail.won}</td>
                  <td className="px-3 py-2.5 text-right text-zinc-400">{detail.drawn}</td>
                  <td className="px-3 py-2.5 text-right text-zinc-400">{detail.lost}</td>
                  <td className="px-3 py-2.5 text-right text-zinc-400">
                    {detail.goalsFor}:{detail.goalsAgainst}
                  </td>
                  <td className="px-3 py-2.5 text-right text-zinc-400">
                    {detail.goalDiff > 0 ? `+${detail.goalDiff}` : detail.goalDiff}
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold">{detail.points}</td>
                </tr>
                {isOpen && (
                  <tr>
                    <td colSpan={9} className="p-0">
                      <TeamDetailPanel detail={detail} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
