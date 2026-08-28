import { requireUser } from "@/lib/auth";
import { computeStandings } from "@/lib/db";
import FormDots from "@/components/FormDots";

const MEDALS = ["🥇", "🥈", "🥉"];

function positionsWord(n: number): string {
  if (n === 1) return "pozycję";
  const lastDigit = n % 10;
  const lastTwo = n % 100;
  if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return "pozycje";
  return "pozycji";
}

function RankDelta({ rank, previousRank }: { rank: number; previousRank: number | null }) {
  if (previousRank === null || previousRank === rank) return null;
  const delta = previousRank - rank;
  const up = delta > 0;
  return (
    <span
      className={`ml-1.5 text-[10px] font-semibold ${up ? "text-emerald-400" : "text-red-400"}`}
      title={`${up ? "Awans" : "Spadek"} o ${Math.abs(delta)} ${positionsWord(Math.abs(delta))} po ostatniej kolejce`}
    >
      {up ? "▲" : "▼"} {Math.abs(delta)}
    </span>
  );
}

export default async function RankingPage() {
  const user = await requireUser();
  const rows = await computeStandings();
  const myRow = rows.find((r) => r.user.id === user.id);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display gold-text text-3xl">Tabela typerów</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Rywalizacja ze znajomymi 🤝⚽ — sprawdź, jak stoisz w lidze.
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          🥇 3 pkt za trafiony dokładny wynik &nbsp;·&nbsp; 1 pkt za trafiony typ
          zwycięzcy/remisu &nbsp;·&nbsp; 0 pkt za chybiony typ &nbsp;·&nbsp; 👑 +10 pkt za
          trafionego mistrza ligi i +10 pkt za króla strzelców.
        </p>
      </div>

      {myRow && (
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[#dc2626]/30 bg-[#dc2626]/10 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-400">Twoje punkty</p>
            <p className="font-display text-2xl text-white">{myRow.points} pkt</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-400">Twoja pozycja</p>
            <p className="flex items-center font-display text-2xl text-white">
              #{myRow.rank}
              <RankDelta rank={myRow.rank} previousRank={myRow.previousRank} />
            </p>
          </div>
          {myRow.hotStreak >= 3 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-400">Seria</p>
              <p className="font-display text-2xl text-white">🔥 {myRow.hotStreak}</p>
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-zinc-400">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Gracz</th>
              <th className="px-4 py-3">Forma</th>
              <th className="px-4 py-3 text-right">Typy</th>
              <th className="px-4 py-3 text-right">Trafione wyniki</th>
              <th className="px-4 py-3 text-right">Trafione typy</th>
              <th className="px-4 py-3 text-right">Specjalne</th>
              <th className="px-4 py-3 text-right">Punkty</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const medal = row.points > 0 ? MEDALS[row.rank - 1] : undefined;
              return (
                <tr
                  key={row.user.id}
                  className={`border-t border-white/10 ${
                    medal === "🥇" ? "bg-[#dc2626]/10" : ""
                  } ${row.user.id === user.id ? "bg-white/5" : ""}`}
                >
                  <td className="px-4 py-3 text-zinc-400">
                    <span className="flex items-center">
                      {medal ? <span className="text-base">{medal}</span> : row.rank}
                      <RankDelta rank={row.rank} previousRank={row.previousRank} />
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {row.user.name}
                    {medal === "🥇" && (
                      <span className="ml-2 text-xs font-normal text-[#dc2626]">
                        Największy Ekspert
                      </span>
                    )}
                    {row.hotStreak >= 3 && (
                      <span className="ml-2 text-xs font-normal text-amber-400" title={`${row.hotStreak} trafionych typów z rzędu`}>
                        🔥 {row.hotStreak}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <FormDots form={row.form} />
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-400">{row.predictionsMade}</td>
                  <td className="px-4 py-3 text-right text-zinc-400">{row.exactHits}</td>
                  <td className="px-4 py-3 text-right text-zinc-400">{row.outcomeHits}</td>
                  <td className="px-4 py-3 text-right text-zinc-400">
                    {row.specialPoints > 0 ? `👑 ${row.specialPoints}` : "—"}
                  </td>
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
