import { useRef, useState } from "react";
import { TIPS } from "../data/plan";
import { emptyData, isValidData } from "../utils/storage";

// Wskazówki z planu + kopia zapasowa. Dane siedzą tylko w tej przeglądarce,
// więc eksport do pliku to jedyny sposób, żeby ich nie stracić.
function MoreView({ data, onReplaceData }) {
  const fileInput = useRef(null);
  const [message, setMessage] = useState("");

  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `trening-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Zapisano plik z kopią.");
  }

  async function importData(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!isValidData(parsed)) throw new Error("zły format");
      if (!window.confirm("Wczytać kopię? Obecne wpisy zostaną zastąpione.")) return;
      onReplaceData(parsed);
      setMessage("Wczytano kopię.");
    } catch {
      setMessage("Nie udało się wczytać pliku. Czy to na pewno kopia z tej appki?");
    }
  }

  function resetData() {
    if (!window.confirm("Na pewno usunąć wszystkie wpisy? Tego nie da się cofnąć.")) return;
    onReplaceData(emptyData());
    setMessage("Wyczyszczono dane.");
  }

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
        Wpisy są zapisywane w tej przeglądarce. Co jakiś czas zrób kopię, żeby ich nie stracić.
      </p>
      <div className="button-row">
        <button type="button" className="primary" onClick={exportData}>
          Zapisz kopię
        </button>
        <button type="button" className="secondary" onClick={() => fileInput.current?.click()}>
          Wczytaj kopię
        </button>
        <button type="button" className="danger" onClick={resetData}>
          Wyczyść wszystko
        </button>
      </div>
      <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={importData} />
      {message && <p className="callout">{message}</p>}
    </section>
  );
}

export default MoreView;
