// Zapis wpisów na koncie Claude.
//
// Gdy appka działa jako artifact w Claude, strona dostaje obiekt
// window.claude, a przez niego bazę danych ("db") przypiętą do Twojego konta.
// Poza Claude (np. `npm run dev`) window.claude nie istnieje - wtedy
// connectCloud() zwraca null i appka zapisuje tylko w localStorage.
//
// W bazie jest jedna kolekcja "logs": jeden dokument na trening,
// a jego id to klucz treningu, np. "3-A" (tydzień 3, dzień A).

export const LOGS_COLLECTION = "logs";
const SAVE_DELAY_MS = 700;

export async function connectCloud() {
  try {
    if (typeof window.claude?.use !== "function") return null;
    return await window.claude.use("db");
  } catch {
    return null;
  }
}

export async function connectDownloads() {
  try {
    if (typeof window.claude?.use !== "function") return null;
    return await window.claude.use("downloads");
  } catch {
    return null;
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Kolejka zapisów. Dwie zasady bazy:
// 1. najwyżej jeden zapis naraz do tego samego dokumentu,
// 2. nie zapisujemy przy każdym naciśnięciu klawisza - seria zmian
//    (pisanie w polu) łączy się w jeden zapis po chwili przerwy.
// onStatus dostaje "saving" | "saved" | "error".
export function createCloudWriter(db, onStatus) {
  const pending = new Map(); // klucz -> najnowsza wartość do zapisania (null = usuń)
  const timers = new Map(); // klucz -> odliczanie do zapisu
  const inFlight = new Set(); // klucze, które właśnie się zapisują
  let lastError = null;

  function report() {
    if (pending.size > 0 || inFlight.size > 0) onStatus("saving");
    else onStatus(lastError ? "error" : "saved");
  }

  async function write(key, value) {
    const ref = db.collection(LOGS_COLLECTION).doc(key);
    const run = () => (value === null ? ref.delete() : ref.set(value));
    try {
      await run();
    } catch (error) {
      // "unavailable" to chwilowy problem z siecią - jedna ponowna próba.
      if (error?.code !== "unavailable") throw error;
      await wait(800 + Math.random() * 800);
      await run();
    }
  }

  async function flush(key) {
    timers.delete(key);
    // Poprzedni zapis tego dokumentu jeszcze trwa - dokończymy po nim.
    if (inFlight.has(key) || !pending.has(key)) return;

    const value = pending.get(key);
    pending.delete(key);
    inFlight.add(key);
    report();
    try {
      await write(key, value);
      lastError = null;
    } catch (error) {
      lastError = error;
      // Nie zgubmy zmiany: zostaje w kolejce i pójdzie przy następnej edycji.
      if (!pending.has(key)) pending.set(key, value);
    } finally {
      inFlight.delete(key);
      if (pending.has(key) && !timers.has(key) && !lastError) flush(key);
      report();
    }
  }

  return {
    schedule(key, value) {
      pending.set(key, value);
      clearTimeout(timers.get(key));
      timers.set(key, setTimeout(() => flush(key), SAVE_DELAY_MS));
      report();
    },
    // Czy ten trening ma niezapisane jeszcze zmiany? Wtedy dane z bazy
    // są starsze niż to, co widać na ekranie, i nie wolno ich nadpisać.
    isBusy(key) {
      return pending.has(key) || inFlight.has(key);
    },
  };
}
