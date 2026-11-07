import { MAX_TEST, NEXT_BLOCK_PERCENT } from "../data/plan";
import { formatKg, parseNumber, roundTo, toInputValue } from "../utils/numbers";
import { defaultMaxTest } from "../utils/training";

// Tydzień 8, dzień A: rozgrzewka + kolejne próby, aż ruch wyraźnie zwolni.
function MaxTestView({ log, onUpdateLog, onStartTimer }) {
  const test = log?.maxTest ?? defaultMaxTest();
  const okWeights = test.attempts.filter((a) => a.result === "ok").map((a) => parseNumber(a.weight));
  const best = okWeights.length ? Math.max(...okWeights) : null;
  const last = test.attempts[test.attempts.length - 1];

  function update(changes) {
    onUpdateLog((prev) => ({ ...prev, maxTest: { ...test, ...changes } }));
  }

  function setAttempt(index, changes) {
    update({ attempts: test.attempts.map((a, i) => (i === index ? { ...a, ...changes } : a)) });
  }

  function markAttempt(index, result) {
    setAttempt(index, { result });
    if (result === "ok") onStartTimer(MAX_TEST.rest, "Przerwa przed kolejną próbą");
  }

  function addAttempt() {
    // Po udanej próbie +2,5 kg, po nieudanej ten sam ciężar jeszcze raz.
    const lastWeight = parseNumber(last.weight) || MAX_TEST.firstAttempt;
    const next = last.result === "ok" ? lastWeight + MAX_TEST.step : lastWeight;
    update({ attempts: [...test.attempts, { weight: toInputValue(next), result: null }] });
  }

  return (
    <div className="max-test">
      <article className="exercise-card">
        <h3>Zasady testu</h3>
        <ul className="plain-list">
          {MAX_TEST.rules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </article>

      <article className="exercise-card">
        <h3>Rozgrzewka</h3>
        {MAX_TEST.warmup.map((step, index) => (
          <label key={step} className="checkbox-row">
            <input
              type="checkbox"
              checked={Boolean(test.warmup[index])}
              onChange={(event) =>
                update({ warmup: test.warmup.map((v, i) => (i === index ? event.target.checked : v)) })
              }
            />
            <span>{step}</span>
          </label>
        ))}
      </article>

      <article className="exercise-card main">
        <h3>Próby</h3>
        {test.attempts.map((attempt, index) => (
          <div key={index} className={`attempt-row ${attempt.result ?? ""}`}>
            <span className="set-index">{index + 1}</span>
            <input
              type="text"
              inputMode="decimal"
              aria-label={`Ciężar próby ${index + 1}`}
              value={attempt.weight}
              onChange={(event) => setAttempt(index, { weight: event.target.value })}
            />
            <span className="muted">kg</span>
            <button
              type="button"
              className={`result-button ok ${attempt.result === "ok" ? "selected" : ""}`}
              onClick={() => markAttempt(index, attempt.result === "ok" ? null : "ok")}
            >
              Zaliczone
            </button>
            <button
              type="button"
              className={`result-button fail ${attempt.result === "fail" ? "selected" : ""}`}
              onClick={() => markAttempt(index, attempt.result === "fail" ? null : "fail")}
            >
              Nie
            </button>
          </div>
        ))}

        {!test.finished && (
          <div className="button-row">
            <button type="button" className="secondary" disabled={!last.result} onClick={addAttempt}>
              + Kolejna próba
            </button>
            <button type="button" className="primary" disabled={best === null} onClick={() => update({ finished: true })}>
              Kończę test
            </button>
          </div>
        )}
        {test.finished && (
          <button type="button" className="link-button" onClick={() => update({ finished: false })}>
            Wróć do edycji prób
          </button>
        )}
      </article>

      {best !== null && (
        <div className="callout success">
          <p className="big-number">{formatKg(best)}</p>
          <p>
            Nowy maks. Następny 8-tygodniowy blok zaczynasz od ok.{" "}
            <strong>{formatKg(roundTo(best * NEXT_BLOCK_PERCENT, 2.5))}</strong> (76% maksa). Taki blok to
            realna droga do 120 kg.
          </p>
        </div>
      )}
    </div>
  );
}

export default MaxTestView;
