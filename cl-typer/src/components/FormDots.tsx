export default function FormDots({ form }: { form: number[] }) {
  if (form.length === 0) {
    return <span className="text-xs text-zinc-500">—</span>;
  }

  return (
    <span className="inline-flex items-center gap-1" title="Forma z ostatnich meczów">
      {form.map((score, i) => {
        const color = score > 0 ? "bg-emerald-500" : "bg-white/15";
        const label = score > 0 ? "3 pkt — trafiony typ" : "0 pkt — chybiony typ";
        return <span key={i} className={`h-2.5 w-2.5 rounded-full ${color}`} title={label} />;
      })}
    </span>
  );
}
