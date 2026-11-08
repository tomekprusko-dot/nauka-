// Dane Twojego projektu Supabase (Project Settings -> API Keys).
// Klucz "publishable" jest publiczny z założenia - bezpieczeństwo zapewniają
// reguły RLS w bazie (patrz supabase/schema.sql), więc może być w repo.
// NIGDY nie wklejaj tu klucza "secret" (sb_secret_...) ani "service_role"!
//
// Dopóki pola są puste, appka działa w trybie lokalnym (dane tylko na telefonie).
// Zmienne VITE_... pozwalają podać inne wartości przy budowaniu (np. do testów).
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://tbkegxwcrmujyxedtxiu.supabase.co";
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_XNcuOT8xMRMGo2WmJ1qZZg_RZeOoutH";
