const STORAGE_KEY = "gym-tracker-data";

// Kształt danych:
// {
//   logs: {
//     "1-A": {                       // tydzień 1, dzień A
//       exercises: { bench: { sets: [{ weight: "80", reps: "5", done: true }, ...] } },
//       maxTest: { warmup: [true, ...], attempts: [{ weight: "107.5", result: "ok" }] },
//       note: "dobrze szło",
//     },
//   },
//   settings: {
//     exerciseNames: { "incline-db": "Skos na maszynie Hammer" },  // Twoje nazwy ćwiczeń
//   },
// }

// Pod tym kluczem ustawienia lądują w bazie - obok treningów "1-A", "1-B"...
export const SETTINGS_KEY = "settings";

export function emptyData() {
  return { logs: {}, settings: {} };
}

// Starsze kopie i zapisy nie mają "settings" - dopisujemy puste.
export function normalizeData(data) {
  return { logs: data.logs, settings: data.settings ?? {} };
}

export function isValidData(data) {
  return Boolean(data) && typeof data === "object" && typeof data.logs === "object" && data.logs !== null;
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : null;
    return isValidData(data) ? normalizeData(data) : emptyData();
  } catch {
    // Np. tryb prywatny albo uszkodzony JSON - zaczynamy od zera zamiast się wywalić.
    return emptyData();
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Brak miejsca / zablokowany storage - appka dalej działa, tylko bez zapisu.
  }
}
