"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Trophy from "@/components/Trophy";
import { logoutAction } from "@/app/login/actions";
import type { InvitedUser } from "@/lib/types";

const links = [
  { href: "/terminarz", label: "Terminarz" },
  { href: "/typy-specjalne", label: "Specjalne" },
  { href: "/ranking", label: "Tabela typerów" },
  { href: "/regulamin", label: "Regulamin" },
];

export default function NavBar({ user }: { user: InvitedUser | null }) {
  const pathname = usePathname();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-10 border-b border-[#dc2626]/25 bg-[#0b1330]/95 backdrop-blur">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
        <Link href="/terminarz" className="flex items-center gap-2 font-semibold text-white">
          <Trophy className="h-6 w-6" />
          <span className="font-display hidden text-lg tracking-wide sm:inline">
            Typer ESA 2026/27
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-3 py-1.5 transition-colors ${
                pathname === link.href
                  ? "bg-[#3d5afe] text-white"
                  : "text-zinc-300 hover:bg-white/10"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user.role === "admin" && (
            <Link
              href="/admin"
              className={`rounded-full px-3 py-1.5 transition-colors ${
                pathname === "/admin"
                  ? "bg-[#3d5afe] text-white"
                  : "text-zinc-300 hover:bg-white/10"
              }`}
            >
              Admin
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3 text-sm text-zinc-300">
          <span className="hidden sm:inline">{user.name}</span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-zinc-200 hover:bg-white/10"
            >
              Wyloguj
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
