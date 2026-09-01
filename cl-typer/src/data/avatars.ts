/**
 * Zdjęcia/logo poszczególnych graczy, wgrywane ręcznie do public/avatars.
 * Klucz to imię gracza z tabeli `users`, zapisane małymi literami.
 */
const PLAYER_AVATARS: Record<string, string> = {
  simba: "/avatars/simba.png",
  albańczyk: "/avatars/albanczyk.png",
};

export function getPlayerAvatar(name: string): string | null {
  return PLAYER_AVATARS[name.toLowerCase()] ?? null;
}
