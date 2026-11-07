// Dane Twojego projektu Supabase (Project Settings -> API).
// Klucz "anon" jest publiczny z założenia - bezpieczeństwo zapewniają
// reguły RLS w bazie (patrz supabase/schema.sql), więc może być w repo.
// NIGDY nie wklejaj tu klucza "service_role"!
//
// Dopóki pola są puste, appka działa w trybie lokalnym (dane tylko na telefonie).
// Zmienne VITE_... pozwalają podać inne wartości przy budowaniu (np. do testów).
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
