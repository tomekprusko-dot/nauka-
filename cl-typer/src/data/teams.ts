import { Team } from "@/lib/types";

/**
 * PRZYKŁADOWE dane. Pełna lista 36 uczestników fazy ligowej LM 2026/27
 * zostanie znana dopiero po zakończeniu rund kwalifikacyjnych w sierpniu 2026.
 * Po ogłoszeniu oficjalnej listy podmień tę tablicę na realne drużyny.
 */
export const teams: Team[] = [
  { id: "real-madrid", name: "Real Madryt", shortName: "RMA", country: "Hiszpania", colors: { bg: "#f5f5f5", fg: "#1b2a4a" } },
  { id: "man-city", name: "Manchester City", shortName: "MCI", country: "Anglia", colors: { bg: "#6cabdd", fg: "#101c44" } },
  { id: "bayern", name: "Bayern Monachium", shortName: "BAY", country: "Niemcy", colors: { bg: "#dc052d", fg: "#ffffff" } },
  { id: "psg", name: "Paris Saint-Germain", shortName: "PSG", country: "Francja", colors: { bg: "#004170", fg: "#ffffff" } },
  { id: "liverpool", name: "Liverpool", shortName: "LIV", country: "Anglia", colors: { bg: "#c8102e", fg: "#ffffff" } },
  { id: "barcelona", name: "FC Barcelona", shortName: "BAR", country: "Hiszpania", colors: { bg: "#a50044", fg: "#edbb00" } },
  { id: "inter", name: "Inter Mediolan", shortName: "INT", country: "Włochy", colors: { bg: "#0c1c6b", fg: "#ffffff" } },
  { id: "arsenal", name: "Arsenal", shortName: "ARS", country: "Anglia", colors: { bg: "#ef0107", fg: "#ffffff" } },
  { id: "dortmund", name: "Borussia Dortmund", shortName: "BVB", country: "Niemcy", colors: { bg: "#fde100", fg: "#0b0b0b" } },
  { id: "juventus", name: "Juventus", shortName: "JUV", country: "Włochy", colors: { bg: "#1c1c1c", fg: "#ffffff" } },
  { id: "atletico", name: "Atlético Madryt", shortName: "ATM", country: "Hiszpania", colors: { bg: "#ce3524", fg: "#ffffff" } },
  { id: "chelsea", name: "Chelsea", shortName: "CHE", country: "Anglia", colors: { bg: "#034694", fg: "#ffffff" } },
  { id: "benfica", name: "Benfica", shortName: "BEN", country: "Portugalia", colors: { bg: "#e2001a", fg: "#ffffff" } },
  { id: "psv", name: "PSV Eindhoven", shortName: "PSV", country: "Holandia", colors: { bg: "#ed1c24", fg: "#ffffff" } },
  { id: "napoli", name: "Napoli", shortName: "NAP", country: "Włochy", colors: { bg: "#12a0d7", fg: "#ffffff" } },
  { id: "leverkusen", name: "Bayer Leverkusen", shortName: "B04", country: "Niemcy", colors: { bg: "#e32221", fg: "#ffffff" } },
];

export function getTeam(id: string): Team | undefined {
  return teams.find((t) => t.id === id);
}
