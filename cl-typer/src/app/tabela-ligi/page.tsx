import { requireUser } from "@/lib/auth";
import { computeTeamDetails } from "@/lib/db";
import TabelaLigiClient from "./TabelaLigiClient";

export default async function TabelaLigiPage() {
  await requireUser();
  const detailsByTeam = await computeTeamDetails();
  const details = Object.values(detailsByTeam).sort((a, b) => a.rank - b.rank);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display gold-text text-3xl">Tabela ligi</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Prawdziwa tabela PKO BP Ekstraklasa 2026/27, licząc po rozegranych kolejkach —
          to nie ranking typerów, tylko realne wyniki drużyn. Kliknij drużynę, żeby zobaczyć więcej.
        </p>
      </div>

      <TabelaLigiClient details={details} />

      <p className="text-xs text-zinc-500 sm:hidden">Przesuń tabelę w bok, żeby zobaczyć kolumnę Pkt.</p>

      <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-300">
        Tabela liczona jest z kolejek 1-6 (prawdziwe wyniki) — kolejka 7 i kolejne dołączą
        automatycznie, gdy zostaną wpisane w Terminarzu. Mecze przełożone przez puchary
        europejskie jeszcze się nie liczą, część drużyn ma więc rozegranych mniej meczów.
      </p>
    </div>
  );
}
