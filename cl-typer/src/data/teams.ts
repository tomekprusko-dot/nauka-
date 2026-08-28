import { Team } from "@/lib/types";

/**
 * 18 klubów PKO BP Ekstraklasy sezonu 2026/27 (potwierdzone po zakończeniu
 * baraży i awansów/spadków w lecie 2026). Barwy to przybliżone kolory
 * klubowe używane wyłącznie do kolorowej plakietki przy nazwie drużyny —
 * nie są to oficjalne herby.
 */
export const teams: Team[] = [
  { id: "legia", name: "Legia Warszawa", shortName: "LEG", city: "Warszawa", colors: { bg: "#0a5c2c", fg: "#ffffff" } },
  { id: "lech", name: "Lech Poznań", shortName: "LEC", city: "Poznań", colors: { bg: "#0b3d91", fg: "#ffffff" } },
  { id: "rakow", name: "Raków Częstochowa", shortName: "RAK", city: "Częstochowa", colors: { bg: "#7a1224", fg: "#ffffff" } },
  { id: "wisla-krakow", name: "Wisła Kraków", shortName: "WIS", city: "Kraków", colors: { bg: "#f5f5f5", fg: "#c8102e" } },
  { id: "slask", name: "Śląsk Wrocław", shortName: "SLA", city: "Wrocław", colors: { bg: "#0a7a3c", fg: "#ffffff" } },
  { id: "wieczysta", name: "Wieczysta Kraków", shortName: "WIE", city: "Kraków", colors: { bg: "#0b1f4e", fg: "#f4c542" } },
  { id: "cracovia", name: "Cracovia", shortName: "CRA", city: "Kraków", colors: { bg: "#c8102e", fg: "#ffffff" } },
  { id: "jagiellonia", name: "Jagiellonia Białystok", shortName: "JAG", city: "Białystok", colors: { bg: "#f4c542", fg: "#c8102e" } },
  { id: "gks-katowice", name: "GKS Katowice", shortName: "GKS", city: "Katowice", colors: { bg: "#1a3f8f", fg: "#c8102e" } },
  { id: "piast", name: "Piast Gliwice", shortName: "PIA", city: "Gliwice", colors: { bg: "#0033a0", fg: "#ffffff" } },
  { id: "wisla-plock", name: "Wisła Płock", shortName: "PLO", city: "Płock", colors: { bg: "#0b1f4e", fg: "#f4c542" } },
  { id: "zaglebie-lubin", name: "Zagłębie Lubin", shortName: "ZAG", city: "Lubin", colors: { bg: "#1b7a3d", fg: "#ffffff" } },
  { id: "radomiak", name: "Radomiak Radom", shortName: "RAD", city: "Radom", colors: { bg: "#1b7a3d", fg: "#f5f5f5" } },
  { id: "widzew", name: "Widzew Łódź", shortName: "WID", city: "Łódź", colors: { bg: "#c8102e", fg: "#ffffff" } },
  { id: "motor-lublin", name: "Motor Lublin", shortName: "MOT", city: "Lublin", colors: { bg: "#0b57a4", fg: "#ffffff" } },
  { id: "korona", name: "Korona Kielce", shortName: "KOR", city: "Kielce", colors: { bg: "#7a1224", fg: "#ffffff" } },
  { id: "pogon", name: "Pogoń Szczecin", shortName: "POG", city: "Szczecin", colors: { bg: "#0b1f4e", fg: "#f4c542" } },
  { id: "gornik-zabrze", name: "Górnik Zabrze", shortName: "GOR", city: "Zabrze", colors: { bg: "#0033a0", fg: "#0b0b0b" } },
];

export function getTeam(id: string): Team | undefined {
  return teams.find((t) => t.id === id);
}
