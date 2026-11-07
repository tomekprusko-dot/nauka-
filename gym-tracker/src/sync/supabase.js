import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../config";

const TABLE = "workout_logs";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Jeden klient na całą appkę. Sesja logowania zapisuje się w localStorage,
// więc po zamknięciu i otwarciu appki nie trzeba logować się ponownie.
export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

// Wszystkie treningi zalogowanej osoby jako { "1-A": {...}, "1-B": {...} }.
// Filtrowania po użytkowniku nie trzeba - baza sama zwraca tylko Twoje wiersze (RLS).
export async function fetchAllLogs() {
  const { data, error } = await supabase.from(TABLE).select("session_key, data");
  if (error) throw error;
  return Object.fromEntries(data.map((row) => [row.session_key, row.data]));
}

// Zapis jednego treningu (value === null oznacza usunięcie).
// "upsert" = wstaw nowy wiersz albo nadpisz istniejący o tym samym kluczu.
export async function writeLog(userId, sessionKey, value) {
  const query =
    value === null
      ? supabase.from(TABLE).delete().eq("session_key", sessionKey)
      : supabase
          .from(TABLE)
          .upsert(
            { user_id: userId, session_key: sessionKey, data: value, updated_at: new Date().toISOString() },
            { onConflict: "user_id,session_key" }
          );
  const { error } = await query;
  if (error) throw error;
}

// Powiadomienia na żywo o zmianach (np. wpis z komputera pojawia się na telefonie).
export function subscribeToChanges(userId, onChange) {
  const channel = supabase
    .channel(`logs-${userId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: TABLE, filter: `user_id=eq.${userId}` }, onChange)
    .subscribe();
  return () => supabase.removeChannel(channel);
}

// Komunikaty Supabase są po angielsku - tłumaczymy te najczęstsze.
export function describeAuthError(error) {
  const message = error?.message ?? "";
  if (/invalid login credentials/i.test(message)) return "Zły email lub hasło.";
  if (/already registered/i.test(message)) return "To konto już istnieje. Zaloguj się.";
  if (/email not confirmed/i.test(message)) return "Najpierw potwierdź email: kliknij link z wiadomości od Supabase.";
  if (/password should be at least/i.test(message)) return "Hasło musi mieć co najmniej 6 znaków.";
  if (/rate limit/i.test(message)) return "Za dużo prób. Odczekaj chwilę i spróbuj ponownie.";
  if (/fetch|network/i.test(message)) return "Brak połączenia z internetem.";
  return message || "Coś poszło nie tak. Spróbuj ponownie.";
}
