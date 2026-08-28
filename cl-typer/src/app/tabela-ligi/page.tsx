import { requireUser } from "@/lib/auth";
import { computeLeagueTable } from "@/lib/db";
import { getTeam } from "@/data/teams";
import TeamBadge from "@/components/TeamBadge";

export default async function TabelaLigiPage() {
  await requireUser();
  const rows = await computeLeagueTable();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display gold-text text-3xl">Tabela ligi</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Prawdziwa tabela PKO BP Ekstraklasa 2026/27, licząc po rozegranych kolejkach —
          to nie ranking typerów, tylko realne wyniki drużyn.
        </p>
      </div>

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
            {rows.map((row, i) => {
              const team = getTeam(row.teamId);
              return (
                <tr key={row.teamId} className="border-t border-white/10">
                  <td className="px-3 py-2.5 text-zinc-400">{i + 1}</td>
                  <td className="px-3 py-2.5 font-medium">
                    <span className="flex items-center gap-2">
                      <TeamBadge team={team} size="sm" />
                      <span className="truncate">{team?.name ?? row.teamId}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right text-zinc-400">{row.played}</td>
                  <td className="px-3 py-2.5 text-right text-zinc-400">{row.won}</td>
                  <td className="px-3 py-2.5 text-right text-zinc-400">{row.drawn}</td>
                  <td className="px-3 py-2.5 text-right text-zinc-400">{row.lost}</td>
                  <td className="px-3 py-2.5 text-right text-zinc-400">
                    {row.goalsFor}:{row.goalsAgainst}
                  </td>
                  <td className="px-3 py-2.5 text-right text-zinc-400">
                    {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold">{row.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-zinc-500 sm:hidden">Przesuń tabelę w bok, żeby zobaczyć kolumnę Pkt.</p>

      <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-300">
        Tabela liczona jest z kolejek 1-5 (prawdziwe wyniki) — kolejka 6 i kolejne dołączą
        automatycznie, gdy zostaną wpisane w Terminarzu. Mecze przełożone przez puchary
        europejskie jeszcze się nie liczą, część drużyn ma więc rozegranych mniej meczów.
      </p>
    </div>
  );
}
