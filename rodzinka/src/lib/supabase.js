import { createClient } from '@supabase/supabase-js'

// Adres bazy i klucz publiczny bierzemy ze "zmiennych środowiskowych":
// lokalnie z pliku .env.local, na Vercelu z ustawień projektu.
// Klucz "anon"/"publishable" jest jawny z założenia: dane chronią reguły RLS w bazie.
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && key)

// Jeden klient na całą appkę. Sesja zapisuje się w pamięci telefonu
// i sama się odświeża, więc logujesz się tylko raz.
export const supabase = isSupabaseConfigured
  ? createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    })
  : null

// Komunikaty Supabase są po angielsku, więc tłumaczymy najczęstsze.
export function describeError(error) {
  const message = error?.message ?? ''
  if (/signups? not allowed|user not found/i.test(message))
    return 'Ten adres nie ma konta w aplikacji. Sprawdź, czy dobrze go wpisałeś.'
  if (/expired|invalid/i.test(message) && /token|otp/i.test(message))
    return 'Kod jest nieprawidłowy albo wygasł. Wyślij nowy.'
  if (/after \d+ seconds|rate limit/i.test(message))
    return 'Za dużo prób. Odczekaj chwilę i spróbuj ponownie.'
  if (/fetch|network/i.test(message)) return 'Brak połączenia z internetem.'
  return message || 'Coś poszło nie tak. Spróbuj ponownie.'
}
