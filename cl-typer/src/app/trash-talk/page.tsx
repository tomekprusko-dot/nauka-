import { requireUser } from "@/lib/auth";
import { computeTrashTalkStats, getAllMatchdayRecaps } from "@/lib/db";
import { MatchdayPerformance, StreakRecord } from "@/lib/types";
import PlayerAvatar from "@/components/PlayerAvatar";
import MatchdayRecapCard from "@/components/MatchdayRecapCard";

function typWord(n: number): string {
  if (n === 1) return "typ";
  const lastDigit = n % 10;
  const lastTwo = n % 100;
  if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return "typy";
  return "typów";
}

function StatCard({
  emoji,
  label,
  tone,
  perf,
}: {
  emoji: string;
  label: string;
  tone: "good" | "bad";
  perf: MatchdayPerformance | null;
}) {
  const border = tone === "good" ? "border-emerald-400/30 bg-emerald-400/10" : "border-red-400/30 bg-red-400/10";
  return (
    <div className={`rounded-xl border px-4 py-3 ${border}`}>
      <p className="text-xs uppercase tracking-wide text-zinc-400">
        {emoji} {label}
      </p>
      {perf ? (
        <p className="mt-1.5 flex flex-wrap items-center gap-2 text-base font-semibold text-white">
          <PlayerAvatar name={perf.userName} size="sm" />
          {perf.userName} — {perf.points} pkt
          <span className="text-xs font-normal text-zinc-400">(kolejka {perf.matchday})</span>
        </p>
      ) : (
        <p className="mt-1.5 text-sm text-zinc-500">Brak jeszcze danych.</p>
      )}
    </div>
  );
}

function StreakCard({
  emoji,
  label,
  tone,
  suffix,
  record,
}: {
  emoji: string;
  label: string;
  tone: "good" | "bad";
  suffix: string;
  record: StreakRecord | null;
}) {
  const border = tone === "good" ? "border-emerald-400/30 bg-emerald-400/10" : "border-red-400/30 bg-red-400/10";
  return (
    <div className={`rounded-xl border px-4 py-3 ${border}`}>
      <p className="text-xs uppercase tracking-wide text-zinc-400">
        {emoji} {label}
      </p>
      {record ? (
        <p className="mt-1.5 flex flex-wrap items-center gap-2 text-base font-semibold text-white">
          <PlayerAvatar name={record.userName} size="sm" />
          {record.userName} — {record.streak} {typWord(record.streak)} z rzędu
          <span className="text-xs font-normal text-zinc-400">{suffix}</span>
        </p>
      ) : (
        <p className="mt-1.5 text-sm text-zinc-500">Brak jeszcze danych.</p>
      )}
    </div>
  );
}

export default async function TrashTalkPage() {
  await requireUser();
  const [stats, recaps] = await Promise.all([computeTrashTalkStats(), getAllMatchdayRecaps()]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display gold-text text-3xl">Archiwum przytyków</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Cała historia uszczypliwych podsumowań kolejek, plus rekordy sezonu — czym można się chwalić i czego
          się wstydzić 🎤
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatCard emoji="🏆" label="Najlepsza kolejka w historii" tone="good" perf={stats.bestMatchday} />
        <StatCard emoji="💩" label="Najgorsza kolejka w historii" tone="bad" perf={stats.worstMatchday} />
        <StreakCard
          emoji="🔥"
          label="Najdłuższa seria trafień w historii"
          tone="good"
          suffix="celnych"
          record={stats.hottestStreak}
        />
        <StreakCard
          emoji="🥶"
          label="Najdłuższa seria pudeł w historii"
          tone="bad"
          suffix="bez trafienia"
          record={stats.coldestStreak}
        />
      </div>

      {recaps.length === 0 ? (
        <p className="text-sm text-zinc-500">Jeszcze żadna kolejka nie doczekała się podsumowania.</p>
      ) : (
        <div className="space-y-3">
          {recaps.map((recap) => (
            <MatchdayRecapCard key={recap.matchday} recap={recap} />
          ))}
        </div>
      )}
    </div>
  );
}
