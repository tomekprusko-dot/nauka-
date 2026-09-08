import PlayerAvatar from "@/components/PlayerAvatar";
import { MatchdayRecap } from "@/lib/types";

/** One matchday's trash-talk card: points pills (best in green, worst in red) plus the recap text. */
export default function MatchdayRecapCard({ recap }: { recap: MatchdayRecap }) {
  return (
    <div className="rounded-xl border border-fuchsia-400/30 bg-fuchsia-400/10 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-fuchsia-300">
        🎤 Podsumowanie kolejki {recap.matchday}
      </p>
      {Object.keys(recap.points).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.entries(recap.points)
            .sort((a, b) => b[1] - a[1])
            .map(([name, pts], i, arr) => {
              const isTop = i === 0 && pts > (arr[arr.length - 1]?.[1] ?? pts);
              const isBottom = i === arr.length - 1 && arr.length > 1 && pts < (arr[0]?.[1] ?? pts);
              return (
                <span
                  key={name}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                    isTop
                      ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-300"
                      : isBottom
                        ? "border-red-400/40 bg-red-400/15 text-red-300"
                        : "border-white/15 bg-white/5 text-zinc-300"
                  }`}
                >
                  <PlayerAvatar name={name} size="sm" />
                  {name} — {pts} pkt
                </span>
              );
            })}
        </div>
      )}
      <p className="mt-2 text-sm text-zinc-100">{recap.recap}</p>
    </div>
  );
}
