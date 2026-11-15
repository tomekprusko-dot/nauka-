// Kolory dzieci. Tailwind potrzebuje pełnych nazw klas wpisanych w kodzie
// (nie da się ich sklejać w locie, np. `bg-${color}-500`), dlatego słownik.
const PALETTE = {
  rose: { solid: 'bg-rose-500 text-white', soft: 'bg-rose-100 text-rose-800', ring: 'ring-rose-500' },
  violet: { solid: 'bg-violet-500 text-white', soft: 'bg-violet-100 text-violet-800', ring: 'ring-violet-500' },
  sky: { solid: 'bg-sky-500 text-white', soft: 'bg-sky-100 text-sky-800', ring: 'ring-sky-500' },
  amber: { solid: 'bg-amber-500 text-white', soft: 'bg-amber-100 text-amber-800', ring: 'ring-amber-500' },
}

export function childColors(color) {
  return PALETTE[color] ?? PALETTE.sky
}
