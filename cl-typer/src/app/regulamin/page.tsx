import { requireUser } from "@/lib/auth";

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

export default async function RegulaminPage() {
  await requireUser();

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

      <Section number={5} icon="👑" title="Typy specjalne">
        <p>
          Przed rozpoczęciem rozgrywek (do pierwszego meczu fazy ligowej) każdy typuje
          dodatkowo, jednorazowo na cały sezon:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Zwycięzcę całej Ligi Mistrzów</strong> — trafiony typ to{" "}
            <strong>+10 punktów</strong>.
          </li>
          <li>
            <strong>Króla strzelców rozgrywek</strong> — trafiony typ to{" "}
            <strong>+10 punktów</strong>.
          </li>
        </ul>
        <p>
          Oba typy ustawiasz na stronie „Typy specjalne”. Po starcie sezonu są
          zablokowane, a punkty doliczane są dopiero po zakończeniu rozgrywek, gdy
          administrator wpisze ostateczne rozstrzygnięcie.
        </p>
      </Section>

      <Section number={6} icon="📊" title="Ranking">
        <p>
          Ranking to suma punktów ze wszystkich rozegranych meczów fazy ligowej oraz
          typów specjalnych. Przy równej liczbie punktów wyżej w tabeli plasuje się
          osoba z większą liczbą trafionych dokładnych wyników (3-punktowych typów).
        </p>
      </Section>

      <Section number={7} icon="📋" title="Wyniki meczów">
        <p>
          Oficjalne wyniki wpisuje administrator po zakończeniu meczu — na ich
          podstawie automatycznie przeliczany jest ranking. W razie oczywistej
          pomyłki w wyniku zgłoś to organizatorowi.
        </p>
      </Section>
    </div>
  );
}
