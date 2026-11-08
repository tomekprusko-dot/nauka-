import { useRef, useState } from "react";
import { TIPS } from "../data/plan";
import { emptyData, isValidData, normalizeData } from "../utils/storage";

// Konto, wskazówki z planu i kopia zapasowa danych.
// Potwierdzenia robimy jako przyciski na stronie, a nie window.confirm() -
// tak wygląda to jak w prawdziwej appce.
function MoreView({ data, account, onReplaceData }) {
  const fileInput = useRef(null);
  const [message, setMessage] = useState("");
  const [pendingImport, setPendingImport] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [signOutWarning, setSignOutWarning] = useState(false);

  function handleSignOut() {
    // Wylogowanie czyści telefon - nie pozwalamy zgubić niewysłanych treningów.
    if (account.hasUnsent()) {
      setSignOutWarning(true);
      return;
    }
    account.onSignOut();
  }

  function exportData() {
    const filename = `lawka-120-${new Date().toISOString().slice(0, 10)}.json`;
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("Zapisano plik z kopią.");
  }

  async function pickFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!isValidData(parsed)) throw new Error("zły format");
      setPendingImport(normalizeData(parsed));
      setMessage("");
    } catch {
      setMessage("Nie udało się wczytać pliku. Czy to na pewno kopia z tej appki?");
    }
  }

  function confirmImport() {
    onReplaceData(pendingImport);
    setPendingImport(null);
    setMessage("Wczytano kopię.");
  }

  function doReset() {
    onReplaceData(emptyData());
    setConfirmReset(false);
    setMessage("Usunięto wszystkie wpisy.");
  }

  const sessionCount = Object.keys(data.logs).length;

  return (
    <section className="more">
      <h2>Konto</h2>
      <article className="exercise-card account-card">
        {account.email ? (
          <>
            <p>
              Zalogowano jako <strong>{account.email}</strong>. Treningi synchronizują się między
              Twoimi urządzeniami.
            </p>
            <button type="button" className="secondary" onClick={handleSignOut}>
              Wyloguj
            </button>
            {signOutWarning && (
              <p className="form-error">
                Część treningów nie jest jeszcze wysłana. Połącz się z internetem i poczekaj na
                „Zsynchronizowano”, potem się wyloguj.
              </p>
            )}
          </>
        ) : account.available ? (
          <>
            <p>Treningi są tylko na tym telefonie. Zaloguj się, żeby mieć je w chmurze i na innych urządzeniach.</p>
            <button type="button" className="primary" onClick={account.onSignIn}>
              Zaloguj się
            </button>
          </>
        ) : (
          <p>Synchronizacja nie jest jeszcze skonfigurowana. Treningi są tylko na tym telefonie.</p>
        )}
      </article>

      <h2>Wskazówki z planu</h2>
      {TIPS.map((tip) => (
        <article key={tip.title} className="exercise-card">
          <h3>{tip.title}</h3>
          <p>{tip.text}</p>
        </article>
      ))}

      <h2>Twoje dane</h2>
      <p className="small muted">
        Kopia do pliku przyda się przy przenosinach albo jako dodatkowe zabezpieczenie. Zapisanych
        treningów: {sessionCount}.
      </p>
      <div className="button-row">
        <button type="button" className="primary" onClick={exportData}>
          Zapisz kopię do pliku
        </button>
        <button type="button" className="secondary" onClick={() => fileInput.current?.click()}>
          Wczytaj kopię
        </button>
        <button type="button" className="danger" onClick={() => setConfirmReset(true)}>
          Wyczyść wszystko
        </button>
      </div>
      <input id="import-file" ref={fileInput} type="file" accept="application/json,.json" hidden onChange={pickFile} />

      {pendingImport && (
        <div className="callout warning">
          <p>
            Wczytać kopię ({Object.keys(pendingImport.logs).length} treningów)? Obecne wpisy zostaną zastąpione.
          </p>
          <div className="button-row">
            <button type="button" className="primary" onClick={confirmImport}>
              Tak, wczytaj
            </button>
            <button type="button" className="secondary" onClick={() => setPendingImport(null)}>
              Anuluj
            </button>
          </div>
        </div>
      )}

      {confirmReset && (
        <div className="callout warning">
          <p>Na pewno usunąć wszystkie wpisy? Tego nie da się cofnąć.</p>
          <div className="button-row">
            <button type="button" className="danger" onClick={doReset}>
              Tak, usuń wszystko
            </button>
            <button type="button" className="secondary" onClick={() => setConfirmReset(false)}>
              Anuluj
            </button>
          </div>
        </div>
      )}

      {message && <p className="callout">{message}</p>}
    </section>
  );
}

export default MoreView;
