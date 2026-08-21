"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RequireAuth({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (adminOnly && user.role !== "admin") {
      router.replace("/terminarz");
    }
  }, [loading, user, adminOnly, router]);

  if (loading || !user || (adminOnly && user.role !== "admin")) {
    return (
      <div className="flex flex-1 items-center justify-center text-zinc-400">
        Ładowanie...
      </div>
    );
  }

  return <>{children}</>;
}
