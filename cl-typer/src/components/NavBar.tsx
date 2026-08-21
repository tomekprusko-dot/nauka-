"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Trophy from "@/components/Trophy";

const links = [
  { href: "/terminarz", label: "Terminarz" },
  { href: "/ranking", label: "Ranking" },
  { href: "/regulamin", label: "Regulamin" },
];

export default function NavBar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (!user) return null;

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-10 border-b border-[#f4c542]/25 bg-[#0b1330]/95 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/terminarz" className="flex items-center gap-2 font-semibold text-white">
          <Trophy className="h-6 w-6" />
          <span className="font-display hidden text-lg tracking-wide sm:inline">
            Typer LM 2026/27
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
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
          <button
            onClick={handleLogout}
            className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-zinc-200 hover:bg-white/10"
          >
            Wyloguj
          </button>
        </div>
      </div>
    </header>
  );
}
