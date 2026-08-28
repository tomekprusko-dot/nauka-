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
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#f87171] to-[#991b1b] text-xs font-bold text-white">
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
          Zasady typowania wyników meczy sezonu PKO BP Ekstraklasa 2026/27.
        </p>
      </div>

      <Section number={1} icon="🎟️" title="Kto może grać">
        <p>
          W typowaniu bierze udział wyłącznie osoby zaproszone przez organizatora
          (dostęp na podstawie imienia i indywidualnego kodu dostępu).
        </p>
      </Section>

      <Section number={2} icon="✍️" title="Jak typować">
        <p>
          Dla każdego meczu wybierasz zwycięzcę albo remis: <strong>1</strong> —
          wygrana gospodarzy, <strong>X</strong> — remis, <strong>2</strong> — wygrana
          gości. Nie podajesz dokładnego wyniku bramkowego. Typ zapisujesz przyciskiem
          „Zapisz” na stronie Terminarz — możesz go zmieniać dowolną liczbę razy aż do
          rozpoczęcia meczu.
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
            <strong>3 punkty</strong> — trafiony typ zwycięzcy albo remisu (np.
            typowałeś 1 — wygraną gospodarzy — i faktycznie wygrali gospodarze, bez
            względu na wynik).
          </li>
          <li>
            <strong>0 punktów</strong> — chybiony typ (wskazałeś inny wynik meczu niż
            faktyczny) albo brak typu przed startem meczu.
          </li>
        </ul>
      </Section>

      <Section number={5} icon="👑" title="Typ specjalny">
        <p>
          Przed rozpoczęciem rozgrywek (do pierwszego meczu sezonu) każdy typuje
          dodatkowo, jednorazowo na cały sezon, kto zostanie{" "}
          <strong>Mistrzem Polski</strong> — trafiony typ to <strong>+10 punktów</strong>.
        </p>
        <p>
          Typ ustawiasz na stronie „Wytypuj mistrza”. Po starcie sezonu jest
          zablokowany, a punkty doliczane są dopiero po zakończeniu rozgrywek, gdy
          administrator wpisze ostateczne rozstrzygnięcie.
        </p>
      </Section>

      <Section number={6} icon="📊" title="Ranking">
        <p>
          Ranking to suma punktów ze wszystkich rozegranych meczów sezonu oraz
          typu specjalnego. Przy równej liczbie punktów wyżej w tabeli plasuje się
          osoba z większą liczbą trafionych typów.
        </p>
      </Section>

      <Section number={7} icon="📋" title="Wyniki meczów">
        <p>
          Wyniki pojawiają się w aplikacji automatycznie, zwykle w ciągu
          15-30 minut od zakończenia meczu — system sam sprawdza w internecie,
          czy mecz się skończył i jaki jest wynik, i na tej podstawie od razu
          przelicza ranking oraz Tabelę ligi. To nie jest natychmiastowe
          (zależy, jak szybko wynik pojawi się w serwisach sportowych), a dla
          kolejek bardziej odległych w czasie wyniki mogą dochodzić wolniej,
          przy cotygodniowym przeglądzie terminarza. W razie oczywistej
          pomyłki w wyniku zgłoś to organizatorowi — administrator może
          poprawić wynik ręcznie w panelu.
        </p>
      </Section>
    </div>
  );
}
