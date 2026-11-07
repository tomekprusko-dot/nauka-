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
// }
export function emptyData() {
  return { logs: {} };
}

export function isValidData(data) {
  return Boolean(data) && typeof data === "object" && typeof data.logs === "object" && data.logs !== null;
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : null;
    return isValidData(data) ? data : emptyData();
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
