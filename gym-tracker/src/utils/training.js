import { BENCH_PROGRESSION, EXERCISES, MAX_TEST, SESSIONS, WEEK_COUNT } from "../data/plan";
import { estimateOneRepMax, parseNumber, toInputValue } from "./numbers";

export function sessionKey(week, sessionId) {
  return `${week}-${sessionId}`;
}

export function getSession(sessionId) {
  return SESSIONS.find((session) => session.id === sessionId);
}

// Twoja nazwa ćwiczenia (jeśli ją zmieniłeś) - reszta ćwiczenia zostaje z planu.
// id się nie zmienia, więc historia i podpowiedzi ciężarów działają dalej.
export function applyExerciseName(exercise, exerciseNames) {
  const custom = exerciseNames?.[exercise.id];
  return custom ? { ...exercise, name: custom, originalName: exercise.name } : exercise;
}

// Ćwiczenie z planu albo dopisane przez Ciebie (settings.customExercises).
export function getExerciseDef(id, settings) {
  return EXERCISES[id] ?? settings?.customExercises?.[id] ?? null;
}

// Pola ćwiczenia z planu, które możesz zmienić (settings.exerciseOverrides).
export const EDITABLE_FIELDS = ["sets", "repsMin", "repsMax", "rest", "fixedWeight"];

// Ćwiczenie z Twoimi zmianami: nazwa (exerciseNames) i parametry (exerciseOverrides).
// originalName / edited mówią, czy jest co przywracać "z planu".
export function resolveExercise(exercise, settings) {
  if (!exercise) return null;
  const overrides = settings?.exerciseOverrides?.[exercise.id];
  const named = applyExerciseName(exercise, settings?.exerciseNames);
  if (!overrides || exercise.custom) return named;
  return { ...named, ...overrides, edited: true, planDefaults: exercise };
}

// Czy ćwiczenie jest dopisane do tego dnia na stałe (w każdym tygodniu)?
export function isPermanentExtra(settings, sessionId, exerciseId) {
  return Boolean(settings?.sessionExtras?.[sessionId]?.includes(exerciseId));
}

// Lista ćwiczeń treningu, w Twojej kolejności:
// 1. z planu dnia, bez tych usuniętych na stałe (settings.sessionRemoved),
// 2. dopisane na stałe (settings.sessionExtras) i tylko w tym treningu (log.extraExerciseIds),
// 3. takie, które mają tu odhaczone serie - żeby historia nie znikała po
//    usunięciu ćwiczenia z dnia albo przeniesieniu go do innego dnia,
// bez usuniętych tylko z tego treningu (log.removedExerciseIds).
export function getSessionExerciseIds(session, settings, log) {
  const removedAlways = settings?.sessionRemoved?.[session.id] ?? [];
  const removedHere = log?.removedExerciseIds ?? [];
  const ids = session.exerciseIds.filter((id) => !removedAlways.includes(id));
  const doneHere = Object.keys(log?.exercises ?? {}).filter((id) =>
    log.exercises[id].sets?.some((set) => set.done)
  );
  const extras = [...(settings?.sessionExtras?.[session.id] ?? []), ...(log?.extraExerciseIds ?? []), ...doneHere];
  for (const id of extras) {
    if (!ids.includes(id) && getExerciseDef(id, settings)) ids.push(id);
  }
  const visible = ids.filter((id) => !removedHere.includes(id));

  // Twoja kolejność (settings.sessionOrder); ćwiczeń spoza niej nie ruszamy - idą na koniec.
  const order = settings?.sessionOrder?.[session.id];
  if (!order) return visible;
  const position = (id) => (order.includes(id) ? order.indexOf(id) : order.length + visible.indexOf(id));
  return [...visible].sort((a, b) => position(a) - position(b));
}

export function getSessionExercises(session, settings, log) {
  return getSessionExerciseIds(session, settings, log).map((id) => resolveExercise(getExerciseDef(id, settings), settings));
}

export function getBenchPlan(week) {
  return BENCH_PROGRESSION.find((plan) => plan.week === week);
}

// W tygodniu 8 dzień A to test maksa zamiast normalnego treningu.
export function isMaxTestSession(week, sessionId) {
  return Boolean(getBenchPlan(week)?.test) && sessionId === "A";
}

export function formatReps(exercise) {
  return exercise.repsMin === exercise.repsMax
    ? String(exercise.repsMin)
    : `${exercise.repsMin}–${exercise.repsMax}`;
}

// Opis celu, np. "4 × 5 · 80 kg" albo "3 × 8–10".
export function getTargetLabel(exercise, week) {
  if (exercise.main) {
    const plan = getBenchPlan(week);
    return `${plan.sets} × ${plan.reps} · ${String(plan.weight).replace(".", ",")} kg`;
  }
  const base = `${exercise.sets} × ${formatReps(exercise)}`;
  return exercise.fixedWeight !== undefined ? `${base} · ${toInputValue(exercise.fixedWeight)} kg` : base;
}

// Lista wszystkich treningów PRZED wskazanym, od najnowszego do najstarszego.
function previousSessionKeys(week, sessionId) {
  const keys = [];
  const index = SESSIONS.findIndex((session) => session.id === sessionId);
  for (let w = week; w >= 1; w--) {
    const start = w === week ? index - 1 : SESSIONS.length - 1;
    for (let i = start; i >= 0; i--) keys.push(sessionKey(w, SESSIONS[i].id));
  }
  return keys;
}

// Serie z ostatniego razu, kiedy robiłeś to ćwiczenie (tylko odhaczone).
export function findPreviousSets(logs, exerciseId, week, sessionId) {
  for (const key of previousSessionKeys(week, sessionId)) {
    const sets = logs[key]?.exercises?.[exerciseId]?.sets;
    const done = sets?.filter((set) => set.done);
    if (done && done.length > 0) return done;
  }
  return null;
}

// Zasada z planu: gdy zrobisz górny zakres powtórzeń we wszystkich seriach,
// następnym razem dołóż najmniejszy możliwy ciężar.
export function getProgressionHint(exercise, previousSets) {
  if (!previousSets || exercise.main || exercise.fixedWeight) return null;
  const hitTop =
    previousSets.length >= exercise.sets &&
    previousSets.every((set) => parseNumber(set.reps) >= exercise.repsMax);
  if (!hitTop) return null;

  if (!exercise.increment) {
    return { text: `Ostatnio ${exercise.sets} × ${exercise.repsMax} - czas utrudnić ćwiczenie` };
  }
  const lastWeight = parseNumber(previousSets[previousSets.length - 1].weight) || 0;
  return {
    weight: lastWeight + exercise.increment,
    text: `Ostatnio wszystkie serie po ${exercise.repsMax} - dokładamy ${String(exercise.increment).replace(".", ",")} kg`,
  };
}

// Serie, które pokazujemy, zanim cokolwiek wpiszesz w danym treningu.
// Ciężar bierzemy z planu, z podpowiedzi progresji albo z ostatniego razu.
export function getDefaultSets(exercise, week, logs, sessionId) {
  if (exercise.main) {
    const plan = getBenchPlan(week);
    return Array.from({ length: plan.sets }, () => ({
      weight: toInputValue(plan.weight),
      reps: String(plan.reps),
      done: false,
    }));
  }

  const previous = findPreviousSets(logs, exercise.id, week, sessionId);
  const hint = getProgressionHint(exercise, previous);
  const lastWeight = previous ? parseNumber(previous[previous.length - 1].weight) : NaN;

  let weight = exercise.fixedWeight ?? hint?.weight;
  if (weight === undefined) weight = Number.isNaN(lastWeight) ? exercise.startWeight : lastWeight;

  return Array.from({ length: exercise.sets }, () => ({
    weight: weight === undefined ? "" : toInputValue(weight),
    reps: exercise.fixedWeight ? String(exercise.repsMax) : "",
    done: false,
  }));
}

export function getExerciseSets(logs, exercise, week, sessionId) {
  return (
    logs[sessionKey(week, sessionId)]?.exercises?.[exercise.id]?.sets ??
    getDefaultSets(exercise, week, logs, sessionId)
  );
}

// Ile serii odhaczono / ile jest w planie (bez ćwiczeń opcjonalnych).
// Uwzględnia Twoje zmiany: usunięte ćwiczenia i zmienioną liczbę serii.
export function getSessionProgress(logs, week, session, settings) {
  const log = logs[sessionKey(week, session.id)];
  if (isMaxTestSession(week, session.id)) {
    const finished = Boolean(log?.maxTest?.finished);
    return { done: finished ? 1 : 0, total: 1 };
  }
  let done = 0;
  let total = 0;
  for (const exercise of getSessionExercises(session, settings, log)) {
    if (exercise.optional) continue;
    const sets = getExerciseSets(logs, exercise, week, session.id);
    total += sets.length;
    done += sets.filter((set) => set.done).length;
  }
  return { done, total };
}

export function isSessionComplete(logs, week, session, settings) {
  const { done, total } = getSessionProgress(logs, week, session, settings);
  return total > 0 && done >= total;
}

// Wynik głównego wyciskania w danym tygodniu (1-7).
export function getBenchResult(logs, week) {
  const plan = getBenchPlan(week);
  if (!plan || plan.test) return null;
  const sets = logs[sessionKey(week, "A")]?.exercises?.bench?.sets ?? [];
  const doneSets = sets.filter((set) => set.done);
  if (doneSets.length === 0) return { started: false, plan };

  const allHit =
    doneSets.length >= plan.sets &&
    doneSets.every((set) => parseNumber(set.weight) >= plan.weight && parseNumber(set.reps) >= plan.reps);
  const bestE1rm = Math.max(
    ...doneSets.map((set) => estimateOneRepMax(parseNumber(set.weight), parseNumber(set.reps)))
  );
  const topWeight = Math.max(...doneSets.map((set) => parseNumber(set.weight)));
  return { started: true, plan, doneSets, allHit, bestE1rm, topWeight };
}

// Najlepsza zaliczona próba z testu maksa.
export function getMaxTestBest(logs) {
  const testWeek = WEEK_COUNT;
  const attempts = logs[sessionKey(testWeek, "A")]?.maxTest?.attempts ?? [];
  const ok = attempts.filter((attempt) => attempt.result === "ok").map((a) => parseNumber(a.weight));
  return ok.length ? Math.max(...ok) : null;
}

export function defaultMaxTest() {
  return {
    warmup: MAX_TEST.warmup.map(() => false),
    attempts: [{ weight: toInputValue(MAX_TEST.firstAttempt), result: null }],
    finished: false,
  };
}

// Tydzień oznaczony jako zrobiony poza appką (np. w zeszycie albo w starej wersji).
export function isWeekDoneOutside(settings, week) {
  return Boolean(settings?.doneOutsideWeeks?.includes(week));
}

// Czy w tym tygodniu jest choć jedna odhaczona seria albo próba z testu?
export function weekHasEntries(logs, week) {
  return SESSIONS.some((session) => {
    const log = logs[sessionKey(week, session.id)];
    if (!log) return false;
    if (log.maxTest?.attempts?.some((attempt) => attempt.result)) return true;
    return Object.values(log.exercises ?? {}).some((exercise) => exercise.sets?.some((set) => set.done));
  });
}

// Pierwszy nieskończony trening na siłowni (A lub B) - od niego startuje appka.
// Tygodnie zrobione poza appką pomijamy.
export function findNextSession(logs, settings) {
  for (let week = 1; week <= WEEK_COUNT; week++) {
    if (isWeekDoneOutside(settings, week)) continue;
    for (const session of SESSIONS.filter((s) => !s.home)) {
      if (!isSessionComplete(logs, week, session, settings)) return { week, sessionId: session.id };
    }
  }
  return { week: WEEK_COUNT, sessionId: "A" };
}
