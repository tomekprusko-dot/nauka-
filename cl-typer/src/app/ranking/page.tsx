"use client";

import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import * as store from "@/lib/store";
import { StandingsRow } from "@/lib/types";

const MEDALS = ["🥇", "🥈", "🥉"];

function RankingContent() {
  const [rows, setRows] = useState<StandingsRow[]>([]);

  useEffect(() => {
    setRows(store.computeStandings());
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display gold-text text-3xl">Ranking typowania</h1>
        <p className="mt-1 text-sm text-zinc-400">
          🥇 3 pkt za trafiony dokładny wynik &nbsp;·&nbsp; 1 pkt za trafiony typ
          zwycięzcy/remisu &nbsp;·&nbsp; 0 pkt za chybiony typ.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-zinc-400">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Gracz</th>
              <th className="px-4 py-3 text-right">Typy</th>
              <th className="px-4 py-3 text-right">Trafione wyniki</th>
              <th className="px-4 py-3 text-right">Trafione typy</th>
              <th className="px-4 py-3 text-right">Punkty</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const medal = row.points > 0 ? MEDALS[i] : undefined;
              return (
                <tr
                  key={row.user.id}
                  className={`border-t border-white/10 ${
                    medal === "🥇" ? "bg-[#f4c542]/10" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-zinc-400">
                    {medal ? <span className="text-base">{medal}</span> : i + 1}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {row.user.name}
                    {medal === "🥇" && (
                      <span className="ml-2 text-xs font-normal text-[#f4c542]">
                        Największy Ekspert
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-400">{row.predictionsMade}</td>
                  <td className="px-4 py-3 text-right text-zinc-400">{row.exactHits}</td>
                  <td className="px-4 py-3 text-right text-zinc-400">{row.outcomeHits}</td>
                  <td className="px-4 py-3 text-right font-semibold">{row.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-zinc-500 sm:hidden">Przesuń tabelę w bok, żeby zobaczyć kolumnę Punkty.</p>

      {rows.length === 0 && (
        <p className="text-sm text-zinc-500">Brak jeszcze żadnych typów.</p>
      )}
    </div>
  );
}

export default function RankingPage() {
  return (
    <RequireAuth>
      <RankingContent />
    </RequireAuth>
  );
}
