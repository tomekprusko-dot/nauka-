import { Fixture } from "@/lib/types";

/**
 * PRZYKŁADOWY terminarz. Realne pary meczów fazy ligowej LM 2026/27 poznamy
 * dopiero po losowaniu 27 sierpnia 2026. Do tego czasu te dane służą wyłącznie
 * do testowania działania aplikacji (typowanie, punktacja, ranking).
 * Po losowaniu podmień tę tablicę na oficjalny terminarz UEFA.
 */
export const fixtures: Fixture[] = [
  { id: "md1-1", matchday: 1, homeTeamId: "real-madrid", awayTeamId: "arsenal", kickoff: "2026-09-16T18:45:00Z" },
  { id: "md1-2", matchday: 1, homeTeamId: "man-city", awayTeamId: "inter", kickoff: "2026-09-16T18:45:00Z" },
  { id: "md1-3", matchday: 1, homeTeamId: "bayern", awayTeamId: "psv", kickoff: "2026-09-16T18:45:00Z" },
  { id: "md1-4", matchday: 1, homeTeamId: "psg", awayTeamId: "napoli", kickoff: "2026-09-17T18:45:00Z" },
  { id: "md1-5", matchday: 1, homeTeamId: "liverpool", awayTeamId: "leverkusen", kickoff: "2026-09-17T18:45:00Z" },
  { id: "md1-6", matchday: 1, homeTeamId: "barcelona", awayTeamId: "chelsea", kickoff: "2026-09-17T18:45:00Z" },
  { id: "md1-7", matchday: 1, homeTeamId: "dortmund", awayTeamId: "benfica", kickoff: "2026-09-16T18:45:00Z" },
  { id: "md1-8", matchday: 1, homeTeamId: "atletico", awayTeamId: "juventus", kickoff: "2026-09-17T18:45:00Z" },

  { id: "md2-1", matchday: 2, homeTeamId: "arsenal", awayTeamId: "inter", kickoff: "2026-09-30T18:45:00Z" },
  { id: "md2-2", matchday: 2, homeTeamId: "napoli", awayTeamId: "real-madrid", kickoff: "2026-09-30T18:45:00Z" },
  { id: "md2-3", matchday: 2, homeTeamId: "chelsea", awayTeamId: "bayern", kickoff: "2026-10-01T18:45:00Z" },
  { id: "md2-4", matchday: 2, homeTeamId: "leverkusen", awayTeamId: "man-city", kickoff: "2026-10-01T18:45:00Z" },
  { id: "md2-5", matchday: 2, homeTeamId: "benfica", awayTeamId: "barcelona", kickoff: "2026-10-01T18:45:00Z" },
  { id: "md2-6", matchday: 2, homeTeamId: "juventus", awayTeamId: "psg", kickoff: "2026-09-30T18:45:00Z" },
  { id: "md2-7", matchday: 2, homeTeamId: "psv", awayTeamId: "dortmund", kickoff: "2026-10-01T18:45:00Z" },
  { id: "md2-8", matchday: 2, homeTeamId: "liverpool", awayTeamId: "atletico", kickoff: "2026-09-30T18:45:00Z" },
];

/** Kickoff of the very first fixture — special picks lock at this moment. */
export function getTournamentStart(): string {
  return fixtures.reduce((earliest, f) => (f.kickoff < earliest ? f.kickoff : earliest), fixtures[0].kickoff);
}
