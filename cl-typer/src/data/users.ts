import { InvitedUser } from "@/lib/types";

/**
 * Startowa lista zaproszonych osób (etap "tylko frontend").
 * Docelowo zarządzanie dostępem przeniesiemy do prawdziwego backendu
 * (Supabase Auth) — na razie admin dodaje/usuwa osoby w panelu /admin,
 * a zmiany trzymane są w localStorage przeglądarki.
 */
export const seedUsers: InvitedUser[] = [
  {
    id: "u-admin",
    name: "Tomek",
    email: "tomekprusko@gmail.com",
    accessCode: "ADMIN2026",
    role: "admin",
  },
  {
    id: "u-demo1",
    name: "Kuba",
    email: "kuba@example.com",
    accessCode: "KUBA123",
    role: "user",
  },
  {
    id: "u-demo2",
    name: "Ola",
    email: "ola@example.com",
    accessCode: "OLA123",
    role: "user",
  },
];
