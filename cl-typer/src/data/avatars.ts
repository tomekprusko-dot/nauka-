/**
 * Zdjęcia/logo poszczególnych graczy, wgrywane ręcznie do public/avatars.
 * Klucz to imię gracza z tabeli `users`, zapisane małymi literami.
 */
const PLAYER_AVATARS: Record<string, string> = {
  tomek: "/avatars/tomek.png",
  simba: "/avatars/simba.png",
  albańczyk: "/avatars/albanczyk.png",
  malinozzi: "/avatars/malinozzi.png",
};

export function getPlayerAvatar(name: string): string | null {
  return PLAYER_AVATARS[name.toLowerCase()] ?? null;
}
