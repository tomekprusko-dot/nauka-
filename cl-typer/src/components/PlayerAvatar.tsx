import Image from "next/image";
import { getPlayerAvatar } from "@/data/avatars";

export default function PlayerAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const dims = size === "sm" ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs";
  const px = size === "sm" ? 24 : 32;
  const src = getPlayerAvatar(name);

  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={px}
        height={px}
        className={`${dims} shrink-0 rounded-full object-cover shadow-[0_0_0_1px_rgba(255,255,255,0.15)]`}
      />
    );
  }

  return (
    <span
      className={`flex ${dims} shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 font-bold text-zinc-300`}
      aria-hidden
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
