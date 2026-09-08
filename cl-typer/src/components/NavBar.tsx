"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Trophy from "@/components/Trophy";
import PlayerAvatar from "@/components/PlayerAvatar";
import { logoutAction } from "@/app/login/actions";
import type { InvitedUser } from "@/lib/types";

const links = [
  { href: "/terminarz", label: "Terminarz" },
  { href: "/tabela-ligi", label: "Tabela ligi" },
  { href: "/typy-specjalne", label: "Wytypuj mistrza" },
  { href: "/ranking", label: "Tabela typerów" },
  { href: "/trash-talk", label: "Przytyki" },
  { href: "/regulamin", label: "Regulamin" },
];

export default function NavBar({ user }: { user: InvitedUser | null }) {
  const pathname = usePathname();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-10 border-b border-[#dc2626]/25 bg-[#0b1330]/95 backdrop-blur">
      {/* Fixed at two rows max, whatever the screen width — the link row
          scrolls horizontally instead of wrapping, so a sticky header never
          balloons to 3-4 rows on narrow phones and hides page content
          underneath it (scroll-mt on sections only budgets for ~2 rows). */}
      <div className="mx-auto max-w-4xl px-4 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <Link href="/terminarz" className="flex items-center gap-2 font-semibold text-white">
            <Trophy className="h-6 w-6" />
            <span className="font-display hidden text-lg tracking-wide sm:inline">
              Typer ESA 2026/27
            </span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-zinc-300">
            <PlayerAvatar name={user.name} size="sm" />
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
        <nav className="-mx-4 mt-2 flex flex-nowrap items-center gap-1 overflow-x-auto px-4 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-full px-3 py-1.5 transition-colors ${
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
              className={`shrink-0 rounded-full px-3 py-1.5 transition-colors ${
                pathname === "/admin"
                  ? "bg-[#3d5afe] text-white"
                  : "text-zinc-300 hover:bg-white/10"
              }`}
            >
              Admin
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
