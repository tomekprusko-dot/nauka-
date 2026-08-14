const STORAGE_KEY = "sales-pipeline-monthly-target";

export function loadTarget() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const parsed = Number(raw);
  return raw && !Number.isNaN(parsed) ? parsed : 0;
}

export function saveTarget(amount) {
  localStorage.setItem(STORAGE_KEY, String(amount));
}
