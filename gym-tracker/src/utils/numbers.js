// Na telefonie łatwo wpisać "82,5" z przecinkiem - zamieniamy go na kropkę,
// bo parseFloat() rozumie tylko kropkę. Zwraca NaN, gdy pole jest puste.
export function parseNumber(value) {
  if (value === null || value === undefined || value === "") return NaN;
  return parseFloat(String(value).replace(",", "."));
}

// 82.5 -> "82,5" (polski zapis liczb)
export function formatNumber(value) {
  return Number(value).toLocaleString("pl-PL", { maximumFractionDigits: 2 });
}

// Wartość do pola tekstowego: 82.5 -> "82,5"
export function toInputValue(value) {
  return String(value).replace(".", ",");
}

export function formatKg(value) {
  return `${formatNumber(value)} kg`;
}

// Zaokrągla do najbliższej wielokrotności kroku, np. 79,8 -> 80 przy kroku 2,5
// (talerze na siłowni pozwalają zwykle dołożyć min. 2 × 1,25 kg).
export function roundTo(value, step) {
  return Math.round(value / step) * step;
}

// Szacowany maks (1RM) ze wzoru Epleya: ciężar × (1 + powtórzenia / 30).
// Pozwala porównać np. 90 kg × 3 z 80 kg × 5.
export function estimateOneRepMax(weight, reps) {
  if (!weight || !reps) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}
