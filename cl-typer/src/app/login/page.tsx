"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Trophy from "@/components/Trophy";

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [nameOrEmail, setNameOrEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (user) {
    router.replace("/terminarz");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const ok = login(nameOrEmail, accessCode);
    if (ok) {
      router.push("/terminarz");
    } else {
      setError("Nie znaleziono takiej osoby albo kod dostępu jest błędny.");
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center text-center">
        <Trophy className="trophy-glow h-24 w-24" />
        <h1 className="font-display gold-text mt-3 text-5xl leading-none">
          Typer Ligi Mistrzów
        </h1>
        <p className="font-display mt-1 text-xl tracking-widest text-zinc-300">
          SEZON 2026 / 27
        </p>
        <p className="mt-3 flex items-center gap-1.5 text-sm text-zinc-400">
          <span aria-hidden>⚽</span>
          Dostęp tylko dla Ekspertów piłkarskich
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-[#f4c542]/20 bg-white/5 p-6 shadow-[0_0_40px_-15px_rgba(244,197,66,0.35)]"
      >
        <div className="space-y-1">
          <label className="text-sm text-zinc-300" htmlFor="nameOrEmail">
            Imię albo e-mail
          </label>
          <input
            id="nameOrEmail"
            value={nameOrEmail}
            onChange={(e) => setNameOrEmail(e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[#f4c542]"
            placeholder="np. Kuba"
            autoComplete="username"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-zinc-300" htmlFor="accessCode">
            Kod dostępu
          </label>
          <input
            id="accessCode"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[#f4c542]"
            placeholder="kod otrzymany od organizatora"
            autoComplete="current-password"
            required
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          className="w-full rounded-lg bg-gradient-to-b from-[#ffe27a] to-[#c9922a] px-4 py-2 text-sm font-bold text-[#1b1200] transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Wejdź na boisko ⚽
        </button>
      </form>

      <div className="max-w-sm rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-zinc-400">
        <p className="mb-1 font-medium text-zinc-300">Konta demo (na czas testów):</p>
        <p>Kuba / kod: KUBA123</p>
        <p>Ola / kod: OLA123</p>
        <p>Tomek (admin) / kod: ADMIN2026</p>
      </div>
    </div>
  );
}
