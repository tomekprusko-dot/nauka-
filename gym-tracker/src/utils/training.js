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

export function getSessionExercises(session, exerciseNames) {
  return session.exerciseIds.map((id) => applyExerciseName(EXERCISES[id], exerciseNames));
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
  return exercise.fixedWeight ? `${base} · ${exercise.fixedWeight} kg` : base;
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
export function getSessionProgress(logs, week, session) {
  const log = logs[sessionKey(week, session.id)];
  if (isMaxTestSession(week, session.id)) {
    const finished = Boolean(log?.maxTest?.finished);
    return { done: finished ? 1 : 0, total: 1 };
  }
  let done = 0;
  let total = 0;
  for (const exercise of getSessionExercises(session)) {
    if (exercise.optional) continue;
    const sets = getExerciseSets(logs, exercise, week, session.id);
    total += sets.length;
    done += sets.filter((set) => set.done).length;
  }
  return { done, total };
}

export function isSessionComplete(logs, week, session) {
  const { done, total } = getSessionProgress(logs, week, session);
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

// Pierwszy nieskończony trening na siłowni (A lub B) - od niego startuje appka.
export function findNextSession(logs) {
  for (let week = 1; week <= WEEK_COUNT; week++) {
    for (const session of SESSIONS.filter((s) => !s.home)) {
      if (!isSessionComplete(logs, week, session)) return { week, sessionId: session.id };
    }
  }
  return { week: WEEK_COUNT, sessionId: "A" };
}
