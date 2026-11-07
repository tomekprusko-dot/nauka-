import { useRef, useState } from "react";
import { TIPS } from "../data/plan";
import { emptyData, isValidData } from "../utils/storage";
import { connectDownloads } from "../utils/cloud";

// Wskazówki z planu + kopia zapasowa danych.
// Uwaga: w Claude okienka window.confirm() nie działają (od razu zwracają
// false), więc potwierdzenia robimy jako przyciski na stronie.
function MoreView({ data, syncStatus, onReplaceData }) {
  const fileInput = useRef(null);
  const [message, setMessage] = useState("");
  const [pendingImport, setPendingImport] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  async function exportData() {
    const filename = `trening-${new Date().toISOString().slice(0, 10)}.json`;
    const json = JSON.stringify(data, null, 2);
    const downloads = await connectDownloads();
    if (downloads) {
      // W Claude pobieranie idzie przez okienko potwierdzenia.
      try {
        await downloads.save({ filename, data: json });
        setMessage("Zapisano plik z kopią.");
      } catch (error) {
        setMessage(error?.code === "declined" ? "Anulowano zapis pliku." : "Nie udało się zapisać pliku.");
      }
      return;
    }
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Zapisano plik z kopią.");
  }

  async function pickFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!isValidData(parsed)) throw new Error("zły format");
      setPendingImport(parsed);
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
      <h2>Wskazówki z planu</h2>
      {TIPS.map((tip) => (
        <article key={tip.title} className="exercise-card">
          <h3>{tip.title}</h3>
          <p>{tip.text}</p>
        </article>
      ))}

      <h2>Twoje dane</h2>
      <p className="small muted">
        {syncStatus === "local"
          ? "Wpisy są zapisywane tylko w tej przeglądarce. Co jakiś czas zrób kopię, żeby ich nie stracić."
          : "Wpisy zapisują się na Twoim koncie Claude, więc widzisz je na każdym urządzeniu. Kopia do pliku to dodatkowe zabezpieczenie."}{" "}
        Zapisanych treningów: {sessionCount}.
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
