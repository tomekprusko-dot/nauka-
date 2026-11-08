// Kolejka zapisów do bazy.
//
// 1. Najwyżej jeden zapis naraz dla jednego treningu.
// 2. Seria zmian (pisanie w polu) łączy się w jeden zapis po chwili przerwy.
// 3. Nieudany zapis (brak zasięgu na siłowni!) zostaje w kolejce. Lista
//    niewysłanych treningów ("dirty") ląduje w localStorage, więc przetrwa
//    nawet zamknięcie appki - przy następnym połączeniu wszystko się dośle.
//
// onStatus dostaje: "saving" | "saved" | "offline" | "error".

const DIRTY_STORAGE_KEY = "gym-tracker-dirty";
const SAVE_DELAY_MS = 700;

function loadDirty() {
  try {
    return new Set(JSON.parse(localStorage.getItem(DIRTY_STORAGE_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

export function createSyncQueue(writeFn, onStatus) {
  const pending = new Map(); // klucz -> najnowsza wartość do wysłania (null = usuń)
  const timers = new Map();
  const inFlight = new Set();
  const dirty = loadDirty();
  let failed = false;
  let stopped = false;

  function persistDirty() {
    try {
      localStorage.setItem(DIRTY_STORAGE_KEY, JSON.stringify([...dirty]));
    } catch {
      // brak miejsca - trudno, kolejka w pamięci dalej działa
    }
  }

  function report() {
    if (stopped) return;
    if (failed && pending.size > 0) onStatus(navigator.onLine ? "error" : "offline");
    else if (pending.size > 0 || inFlight.size > 0) onStatus("saving");
    else onStatus("saved");
  }

  async function flush(key) {
    timers.delete(key);
    if (stopped || inFlight.has(key) || !pending.has(key)) return;

    const value = pending.get(key);
    pending.delete(key);
    inFlight.add(key);
    report();
    try {
      await writeFn(key, value);
      failed = false;
      if (!pending.has(key)) {
        dirty.delete(key);
        persistDirty();
      }
    } catch {
      failed = true;
      // Nowsza wersja mogła przyjść w trakcie - wtedy zostaje ona.
      if (!pending.has(key)) pending.set(key, value);
    } finally {
      inFlight.delete(key);
      if (!failed && pending.has(key) && !timers.has(key)) flush(key);
      report();
    }
  }

  return {
    schedule(key, value) {
      pending.set(key, value);
      dirty.add(key);
      persistDirty();
      clearTimeout(timers.get(key));
      timers.set(key, setTimeout(() => flush(key), SAVE_DELAY_MS));
      report();
    },
    // Spróbuj wysłać wszystko, co czeka (po odzyskaniu zasięgu).
    retryAll() {
      failed = false;
      for (const key of pending.keys()) {
        if (!timers.has(key)) flush(key);
      }
      report();
    },
    // Czy ten trening ma zmiany, których baza jeszcze nie zna?
    // Wtedy dane z bazy są starsze niż te na ekranie i nie wolno ich nadpisać.
    isBusy(key) {
      return pending.has(key) || inFlight.has(key);
    },
    dirtyKeys() {
      return [...dirty];
    },
    hasUnsent() {
      return dirty.size > 0;
    },
    stop() {
      stopped = true;
      timers.forEach((timer) => clearTimeout(timer));
    },
  };
}

export function clearDirty() {
  try {
    localStorage.removeItem(DIRTY_STORAGE_KEY);
  } catch {
    // nic
  }
}
