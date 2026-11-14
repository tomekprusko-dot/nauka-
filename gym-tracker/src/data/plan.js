// Cały plan treningowy z dokumentu "Plan: wyciskanie 120 kg + klatka".
// Appka niczego tu nie zmienia - to są "stałe" dane. To, co faktycznie
// wycisnąłeś, trafia osobno do localStorage (patrz utils/storage.js).

export const WEEK_COUNT = 8;

// Progresja głównego wyciskania. Ciężary policzone od maksa ok. 105 kg.
export const BENCH_PROGRESSION = [
  { week: 1, sets: 4, reps: 5, weight: 80, note: "Wejście, dopracuj technikę" },
  { week: 2, sets: 4, reps: 5, weight: 82.5 },
  { week: 3, sets: 4, reps: 4, weight: 87.5 },
  { week: 4, sets: 3, reps: 5, weight: 72.5, note: "Lżejszy tydzień (deload)", deload: true },
  { week: 5, sets: 5, reps: 3, weight: 90 },
  { week: 6, sets: 5, reps: 3, weight: 92.5 },
  { week: 7, sets: 4, reps: 2, weight: 97.5, note: "Ciężkie, z asekuracją" },
  { week: 8, test: true, note: "Test maksa: 107,5–112,5 kg" },
];

// Każde ćwiczenie opisane jednym obiektem:
// - sets, repsMin, repsMax: ile serii i w jakim zakresie powtórzeń,
// - rest: przerwa w sekundach (odpala minutnik po odhaczeniu serii),
// - increment: o ile dokładać, gdy górny zakres wejdzie we wszystkich seriach,
// - bodyweight: ćwiczenie z masą ciała - pole "kg" oznacza obciążenie dodatkowe.
export const EXERCISES = {
  bench: {
    id: "bench",
    name: "Wyciskanie leżąc (sztanga)",
    main: true,
    rest: 180,
  },
  "bench-pause": {
    id: "bench-pause",
    name: "Wyciskanie z pauzą 1 s na klatce",
    sets: 2,
    repsMin: 8,
    repsMax: 8,
    fixedWeight: 70,
    rest: 120,
    note: "Po seriach roboczych. Skoro wyciskasz raz w tygodniu, te serie nadrabiają objętość.",
  },
  "incline-db": {
    id: "incline-db",
    name: "Wyciskanie hantli na skosie dodatnim (30°)",
    sets: 3,
    repsMin: 8,
    repsMax: 10,
    rest: 120,
    startWeight: 30,
    increment: 2.5,
    weightLabel: "kg / ręka",
    note: "Start 30 kg na rękę. Gdy zrobisz 3 × 10 we wszystkich seriach, przejdź na kolejne hantle (32–32,5 kg) i znów buduj od 3 × 8. Zamiennik: skos na maszynie Hammer.",
  },
  butterfly: {
    id: "butterfly",
    name: "Butterfly",
    sets: 3,
    repsMin: 12,
    repsMax: 15,
    rest: 60,
    increment: 2.5,
  },
  "lateral-raise": {
    id: "lateral-raise",
    name: "Wznosy hantli bokiem",
    sets: 4,
    repsMin: 12,
    repsMax: 15,
    rest: 60,
    increment: 1,
    weightLabel: "kg / ręka",
  },
  "reverse-fly": {
    id: "reverse-fly",
    name: "Odwrotne rozpiętki na butterfly (tył barku)",
    sets: 3,
    repsMin: 15,
    repsMax: 15,
    rest: 60,
    increment: 2.5,
  },
  pushdown: {
    id: "pushdown",
    name: "Prostowanie ramion na wyciągu",
    sets: 3,
    repsMin: 10,
    repsMax: 12,
    rest: 60,
    increment: 2.5,
  },
  "overhead-db": {
    id: "overhead-db",
    name: "Wyciskanie hantli nad głowę siedząc",
    sets: 2,
    repsMin: 8,
    repsMax: 10,
    rest: 90,
    increment: 2,
    weightLabel: "kg / ręka",
    optional: true,
    note: "Opcjonalnie, gdy zostaje czas.",
  },

  "pull-up": {
    id: "pull-up",
    name: "Podciąganie",
    sets: 4,
    repsMin: 5,
    repsMax: 8,
    rest: 120,
    bodyweight: true,
    startWeight: 0,
    increment: 2.5,
    weightLabel: "kg dodatk.",
    note: "Dodaj obciążenie, gdy 10+ powtórzeń wchodzi lekko.",
  },
  "barbell-row": {
    id: "barbell-row",
    name: "Wiosłowanie sztangą",
    sets: 4,
    repsMin: 6,
    repsMax: 8,
    rest: 120,
    increment: 2.5,
  },
  pulldown: {
    id: "pulldown",
    name: "Ściąganie drążka wyciągu górnego",
    sets: 3,
    repsMin: 10,
    repsMax: 12,
    rest: 90,
    increment: 2.5,
  },
  "db-row": {
    id: "db-row",
    name: "Wiosłowanie hantlą jednorącz",
    sets: 3,
    repsMin: 10,
    repsMax: 12,
    rest: 90,
    increment: 2.5,
  },
  "face-pull": {
    id: "face-pull",
    name: "Face pull na wyciągu (lekko)",
    sets: 3,
    repsMin: 15,
    repsMax: 15,
    rest: 60,
    increment: 2.5,
    optional: true,
    note: "Lekka praca na tył barku i rotatory, chroni barki przy ciężkiej ławce. Jeśli chcesz w niedzielę zero barków, pomiń.",
  },
  "barbell-curl": {
    id: "barbell-curl",
    name: "Uginanie ramion ze sztangą",
    sets: 3,
    repsMin: 8,
    repsMax: 10,
    rest: 60,
    increment: 2.5,
  },
  "hammer-curl": {
    id: "hammer-curl",
    name: "Uginanie młotkowe z hantlami",
    sets: 2,
    repsMin: 12,
    repsMax: 12,
    rest: 60,
    increment: 2,
    weightLabel: "kg / ręka",
  },

  "pushup-deficit": {
    id: "pushup-deficit",
    name: "Pompki z deficytem",
    sets: 4,
    repsMin: 8,
    repsMax: 15,
    rest: 75,
    bodyweight: true,
    startWeight: 0,
    weightLabel: "kg plecak",
    note: "Dłonie na książkach lub uchwytach. Większe rozciągnięcie klatki.",
  },
  "pushup-tempo": {
    id: "pushup-tempo",
    name: "Pompki z tempem (3 s w dół, 1 s pauzy)",
    sets: 3,
    repsMin: 8,
    repsMax: 10,
    rest: 75,
    bodyweight: true,
    startWeight: 0,
    weightLabel: "kg plecak",
    note: "Kontrola i czas pod napięciem.",
  },
  "pushup-decline": {
    id: "pushup-decline",
    name: "Pompki z nogami na podwyższeniu",
    sets: 3,
    repsMin: 10,
    repsMax: 15,
    rest: 75,
    bodyweight: true,
    startWeight: 0,
    weightLabel: "kg plecak",
    note: "Górna część klatki.",
  },
  "pushup-diamond": {
    id: "pushup-diamond",
    name: "Pompki diamentowe (wąsko)",
    sets: 2,
    repsMin: 8,
    repsMax: 12,
    rest: 75,
    bodyweight: true,
    startWeight: 0,
    weightLabel: "kg plecak",
    note: "Triceps, siła lokautu.",
  },
};

const HOME_EXERCISES = ["pushup-deficit", "pushup-tempo", "pushup-decline", "pushup-diamond"];
const HOME_INFO =
  "15–20 min, we wtorek, środę lub czwartek (w piątek odpuść). Kończ każdą serię 2–3 powtórzenia przed upadkiem mięśniowym.";

// Treningi w tygodniu. Kolejność ma znaczenie - według niej appka szuka
// "ostatniego razu", kiedy robiłeś dane ćwiczenie.
export const SESSIONS = [
  {
    id: "A",
    tab: "A",
    when: "Sobota",
    title: "Dzień A: klatka i barki",
    info: "Pierwsze ok. 40 minut to klatka (ćw. 1–3), reszta to barki.",
    warmup: "Rozgrzewka: sztanga × 10, 50 kg × 5, 65 kg × 3, 75 kg × 2, potem serie robocze.",
    exerciseIds: [
      "bench",
      "bench-pause",
      "incline-db",
      "butterfly",
      "lateral-raise",
      "reverse-fly",
      "overhead-db",
    ],
  },
  {
    id: "B",
    tab: "B",
    when: "Niedziela",
    title: "Dzień B: plecy, biceps i triceps",
    info: "Bez wyciskania i bez barków, bo to dzień po dniu A. Silne plecy stabilizują barki na ławce, a mocny triceps pomaga w końcówce wyciskania.",
    exerciseIds: [
      "pull-up",
      "barbell-row",
      "pulldown",
      "db-row",
      "face-pull",
      "barbell-curl",
      "hammer-curl",
      "pushdown",
    ],
  },
  { id: "H1", tab: "Dom 1", when: "Wt–czw", title: "Dom: pompki (1)", info: HOME_INFO, exerciseIds: HOME_EXERCISES, home: true },
  { id: "H2", tab: "Dom 2", when: "Wt–czw", title: "Dom: pompki (2)", info: HOME_INFO, exerciseIds: HOME_EXERCISES, home: true },
  {
    id: "H3",
    tab: "Dom 3",
    when: "Opcja",
    title: "Dom: pompki (3, opcjonalnie)",
    info: HOME_INFO,
    exerciseIds: HOME_EXERCISES,
    home: true,
    optional: true,
  },
];

// Ćwiczenia z masą ciała nie mają "dołóż 2,5 kg" - zamiast tego się je utrudnia.
export const BODYWEIGHT_PROGRESSIONS = [
  "plecak z obciążeniem (książki, butelki z wodą)",
  "wyższy deficyt lub wyższe podwyższenie pod nogi",
  "pompki łucznicze (ciężar przesunięty na jedną rękę)",
];

// Test maksa w tygodniu 8, w dzień A zamiast normalnego treningu.
export const MAX_TEST = {
  warmup: ["Sztanga × 10", "60 kg × 5", "80 kg × 3", "90 kg × 1", "97,5 kg × 1", "102,5 kg × 1"],
  firstAttempt: 107.5,
  step: 2.5,
  rest: 210,
  rules: [
    "Przerwy 3–4 min, z asekuracją.",
    "Pierwsza próba 107,5 kg. Jeśli lekko: 110 kg. Jeśli nadal dobrze: 112,5 kg.",
    "Kończ, gdy ruch wyraźnie zwalnia. Nie szukaj porażki.",
    "Nie planuj testu dzień po meczu.",
  ],
};

// Po teście: nowy 8-tygodniowy blok, tydzień 1 = ok. 76% nowego maksa.
export const NEXT_BLOCK_PERCENT = 0.76;

export const TIPS = [
  { title: "Sen", text: "Najsłabszy punkt: przy 6,5 h siła rośnie wolniej. Celuj w 7,5 h przynajmniej w noc przed dniem A." },
  { title: "Białko", text: "Ok. 160–200 g dziennie (1,6–2 g na kg masy ciała)." },
  { title: "Kalorie", text: "Przy piłce i bieganiu łatwo o deficyt. Jeśli waga spada, a siła stoi, dorzuć porcję węglowodanów w dni treningowe." },
  { title: "Barki", text: "Przy pierwszym bólu z przodu barku zmniejsz ciężar wyciskania na 1–2 tygodnie zamiast przeć dalej." },
  { title: "Nieudany tydzień", text: "Jeśli w którymś tygodniu nie zrobisz wszystkich powtórzeń wyciskania, powtórz ten tydzień zamiast iść dalej." },
  { title: "Technika", text: "Łopatki ściągnięte i opuszczone, lekki łuk. Stopy mocno w podłodze. Sztanga dotyka dolnej części mostka, łokcie 45–70°. Nadgarstki nad łokciami. Każde powtórzenie identyczne, bez odbijania." },
];
