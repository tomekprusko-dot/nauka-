import { Team } from "@/lib/types";

export default function TeamBadge({ team, size = "md" }: { team: Team | undefined; size?: "sm" | "md" }) {
  const dims = size === "sm" ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs";

  if (!team) {
    return (
      <span
        className={`flex ${dims} shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 font-bold`}
      >
        ?
      </span>
    );
  }

  return (
    <span
      className={`flex ${dims} shrink-0 items-center justify-center rounded-full font-bold shadow-[0_0_0_1px_rgba(255,255,255,0.15)]`}
      style={{ backgroundColor: team.colors.bg, color: team.colors.fg }}
      title={team.name}
    >
      {team.shortName.slice(0, 3)}
    </span>
  );
}
