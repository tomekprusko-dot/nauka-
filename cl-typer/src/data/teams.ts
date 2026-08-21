import { Team } from "@/lib/types";

/**
 * PRZYKŁADOWE dane. Pełna lista 36 uczestników fazy ligowej LM 2026/27
 * zostanie znana dopiero po zakończeniu rund kwalifikacyjnych w sierpniu 2026.
 * Po ogłoszeniu oficjalnej listy podmień tę tablicę na realne drużyny.
 */
export const teams: Team[] = [
  { id: "real-madrid", name: "Real Madryt", shortName: "RMA", country: "Hiszpania" },
  { id: "man-city", name: "Manchester City", shortName: "MCI", country: "Anglia" },
  { id: "bayern", name: "Bayern Monachium", shortName: "BAY", country: "Niemcy" },
  { id: "psg", name: "Paris Saint-Germain", shortName: "PSG", country: "Francja" },
  { id: "liverpool", name: "Liverpool", shortName: "LIV", country: "Anglia" },
  { id: "barcelona", name: "FC Barcelona", shortName: "BAR", country: "Hiszpania" },
  { id: "inter", name: "Inter Mediolan", shortName: "INT", country: "Włochy" },
  { id: "arsenal", name: "Arsenal", shortName: "ARS", country: "Anglia" },
  { id: "dortmund", name: "Borussia Dortmund", shortName: "BVB", country: "Niemcy" },
  { id: "juventus", name: "Juventus", shortName: "JUV", country: "Włochy" },
  { id: "atletico", name: "Atlético Madryt", shortName: "ATM", country: "Hiszpania" },
  { id: "chelsea", name: "Chelsea", shortName: "CHE", country: "Anglia" },
  { id: "benfica", name: "Benfica", shortName: "BEN", country: "Portugalia" },
  { id: "psv", name: "PSV Eindhoven", shortName: "PSV", country: "Holandia" },
  { id: "napoli", name: "Napoli", shortName: "NAP", country: "Włochy" },
  { id: "leverkusen", name: "Bayer Leverkusen", shortName: "B04", country: "Niemcy" },
];

export function getTeam(id: string): Team | undefined {
  return teams.find((t) => t.id === id);
}
