import { BENCH_PROGRESSION } from "../data/plan";
import { getBenchResult, getSession, isSessionComplete, isWeekDoneOutside } from "../utils/training";

// Pasek z tygodniami 1-8. Kropka pod numerem mówi, jak poszło wyciskanie.
function WeekPicker({ logs, settings, week, onChange }) {
  const sessionA = getSession("A");
  const sessionB = getSession("B");

  return (
    <div className="week-picker" role="tablist" aria-label="Tydzień">
      {BENCH_PROGRESSION.map((plan) => {
        const bench = getBenchResult(logs, plan.week);
        const bothDone =
          isSessionComplete(logs, plan.week, sessionA) && isSessionComplete(logs, plan.week, sessionB);
        let status = "";
        if (bothDone || isWeekDoneOutside(settings, plan.week)) status = "done";
        else if (bench?.started && !bench.allHit && isSessionComplete(logs, plan.week, sessionA)) status = "missed";
        else if (bench?.started) status = "started";

        return (
          <button
            key={plan.week}
            type="button"
            role="tab"
            aria-selected={plan.week === week}
            className={`week-pill ${plan.week === week ? "active" : ""} ${status}`}
            onClick={() => onChange(plan.week)}
          >
            <span className="week-number">T{plan.week}</span>
            <span className="week-sub">{plan.test ? "test" : plan.deload ? "lekki" : `${String(plan.weight).replace(".", ",")}`}</span>
          </button>
        );
      })}
    </div>
  );
}

export default WeekPicker;
