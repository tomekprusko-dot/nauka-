import RequireAuth from "@/components/RequireAuth";

function Section({
  number,
  icon,
  title,
  children,
}: {
  number: number;
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
      <h2 className="flex items-center gap-2 font-semibold text-white">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#ffe27a] to-[#c9922a] text-xs font-bold text-[#1b1200]">
          {number}
        </span>
        <span aria-hidden>{icon}</span>
        {title}
      </h2>
      <div className="space-y-2 text-sm leading-relaxed text-zinc-300">{children}</div>
    </section>
  );
}

function RegulaminContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display gold-text text-3xl">Regulamin typowania</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Zasady typowania wyników meczy fazy ligowej Ligi Mistrzów UEFA 2026/27.
        </p>
      </div>

      <Section number={1} icon="🎟️" title="Kto może grać">
        <p>
          W typowaniu bierze udział wyłącznie osoby zaproszone przez organizatora
          (dostęp na podstawie imienia/e-maila i indywidualnego kodu dostępu).
        </p>
      </Section>

      <Section number={2} icon="✍️" title="Jak typować">
        <p>
          Dla każdego meczu podajesz przewidywany dokładny wynik (liczbę bramek
          gospodarzy i gości). Typ zapisujesz przyciskiem „Zapisz” na stronie
          Terminarz — możesz go zmieniać dowolną liczbę razy aż do rozpoczęcia
          meczu.
        </p>
      </Section>

      <Section number={3} icon="🔒" title="Blokada typów po starcie meczu">
        <p>
          Typ jest możliwy tylko <strong>przed</strong> zaplanowaną godziną
          rozpoczęcia spotkania. Z chwilą startu meczu (gwizdek sędziego!) pole typu
          jest blokowane — nie da się już go dodać ani zmienić, niezależnie od tego,
          czy mecz faktycznie już trwa. Brak zapisanego typu przed startem meczu = 0
          punktów za ten mecz.
        </p>
      </Section>

      <Section number={4} icon="🏆" title="Punktacja">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>3 punkty</strong> — trafiony dokładny wynik (np. typowałeś 2:1 i
            padło dokładnie 2:1).
          </li>
          <li>
            <strong>1 punkt</strong> — trafiony sam typ zwycięzcy meczu albo remisu,
            ale niedokładny wynik (np. typowałeś 2:1, a padło 3:1 — obie strony
            wskazują na wygraną gospodarzy).
          </li>
          <li>
            <strong>0 punktów</strong> — chybiony typ (wskazany inny wynik meczu niż
            faktyczny — np. typowałeś wygraną gospodarzy, a wygrali goście) albo brak
            typu przed startem meczu.
          </li>
        </ul>
      </Section>

      <Section number={5} icon="📊" title="Ranking">
        <p>
          Ranking to suma punktów ze wszystkich rozegranych meczów fazy ligowej. Przy
          równej liczbie punktów wyżej w tabeli plasuje się osoba z większą liczbą
          trafionych dokładnych wyników (3-punktowych typów).
        </p>
      </Section>

      <Section number={6} icon="📋" title="Wyniki meczów">
        <p>
          Oficjalne wyniki wpisuje administrator po zakończeniu meczu — na ich
          podstawie automatycznie przeliczany jest ranking. W razie oczywistej
          pomyłki w wyniku zgłoś to organizatorowi.
        </p>
      </Section>
    </div>
  );
}

export default function RegulaminPage() {
  return (
    <RequireAuth>
      <RegulaminContent />
    </RequireAuth>
  );
}
