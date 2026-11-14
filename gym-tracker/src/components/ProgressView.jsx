import { BENCH_PROGRESSION, EXERCISES, SESSIONS, WEEK_COUNT } from "../data/plan";
import { formatKg, formatNumber, parseNumber } from "../utils/numbers";
import { getBenchResult, getExerciseDef, resolveExercise, getMaxTestBest, isWeekDoneOutside, sessionKey } from "../utils/training";

const START_MAX = 105;

// Ćwiczenia dodatkowe z siłowni, których historię ciężarów pokazujemy w tabeli.
const ACCESSORY_IDS = Object.values(EXERCISES)
  .filter((exercise) => !exercise.main && !exercise.fixedWeight && !exercise.id.startsWith("pushup"))
  .map((exercise) => exercise.id);
const WEEKS = Array.from({ length: WEEK_COUNT }, (_, i) => i + 1);

// Najlepsza seria danego ćwiczenia w danym tygodniu (ze wszystkich dni).
function bestSetInWeek(logs, exerciseId, week) {
  const sets = SESSIONS.flatMap(
    (session) => logs[sessionKey(week, session.id)]?.exercises?.[exerciseId]?.sets?.filter((set) => set.done) ?? []
  );
  if (sets.length === 0) return null;
  return sets.reduce((best, set) => {
    const w = parseNumber(set.weight) || 0;
    const bw = parseNumber(best.weight) || 0;
    return w > bw || (w === bw && parseNumber(set.reps) > parseNumber(best.reps)) ? set : best;
  });
}

function ProgressView({ logs, settings, onOpenSession }) {
  // Ćwiczenia z planu + dopisane przez Ciebie.
  const historyIds = [...ACCESSORY_IDS, ...Object.keys(settings.customExercises ?? {})];
  const results = BENCH_PROGRESSION.filter((plan) => !plan.test).map((plan) => getBenchResult(logs, plan.week));
  const estimates = results.filter((r) => r?.started).map((r) => r.bestE1rm);
  const bestEstimate = estimates.length ? Math.max(...estimates) : null;
  const testBest = getMaxTestBest(logs);
  const current = testBest ?? bestEstimate;
  const toGoal = current ? Math.max(0, 120 - current) : null;

  return (
    <section className="progress">
      <div className="stat-grid">
        <div className="stat">
          <span className="stat-label">Start</span>
          <span className="stat-value">~{START_MAX} kg</span>
        </div>
        <div className="stat">
          <span className="stat-label">{testBest ? "Maks z testu" : "Szacowany maks"}</span>
          <span className="stat-value">{current ? formatKg(Math.round(current * 2) / 2) : "–"}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Do 120 kg</span>
          <span className="stat-value">{toGoal === null ? "–" : formatKg(Math.round(toGoal * 2) / 2)}</span>
        </div>
      </div>
      <p className="small muted">
        Szacowany maks liczony ze wzoru Epleya: ciężar × (1 + powtórzenia / 30), z najlepszej serii.
      </p>

      <h2>Wyciskanie tydzień po tygodniu</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Tydz.</th>
              <th>Plan</th>
              <th>Zrobione</th>
              <th>Szac. maks</th>
            </tr>
          </thead>
          <tbody>
            {BENCH_PROGRESSION.map((plan) => {
              const result = getBenchResult(logs, plan.week);
              let doneCell = "–";
              const outside = isWeekDoneOutside(settings, plan.week) && !result?.started;
              if (outside) doneCell = "poza appką ✓";
              else if (plan.test) doneCell = testBest ? `${formatKg(testBest)} ✓` : "–";
              else if (result.started) {
                doneCell = `${result.doneSets.length}/${plan.sets} ${result.allHit ? "✓" : "✗"}`;
              }
              return (
                <tr key={plan.week} className="clickable" onClick={() => onOpenSession(plan.week, "A")}>
                  <td>{plan.week}</td>
                  <td>
                    {plan.test ? "Test maksa" : `${plan.sets} × ${plan.reps} · ${formatKg(plan.weight)}`}
                  </td>
                  <td className={outside ? "ok" : result?.started ? (result.allHit ? "ok" : "fail") : ""}>{doneCell}</td>
                  <td>{result?.started ? formatKg(Math.round(result.bestE1rm * 2) / 2) : "–"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="small muted">Stuknij wiersz, żeby otworzyć ten trening.</p>

      <h2>Ćwiczenia dodatkowe</h2>
      <p className="small muted">Najlepsza seria w tygodniu: ciężar × powtórzenia.</p>
      <div className="table-wrap">
        <table className="history-table">
          <thead>
            <tr>
              <th>Ćwiczenie</th>
              {WEEKS.map((week) => (
                <th key={week}>T{week}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {historyIds.map((id) => (
              <tr key={id}>
                <td className="exercise-name-cell">{resolveExercise(getExerciseDef(id, settings), settings).name}</td>
                {WEEKS.map((week) => {
                  const best = bestSetInWeek(logs, id, week);
                  return (
                    <td key={week}>
                      {best ? `${formatNumber(parseNumber(best.weight) || 0)}×${best.reps}` : ""}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ProgressView;
