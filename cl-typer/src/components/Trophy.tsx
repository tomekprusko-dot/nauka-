export default function Trophy({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 110"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="trophyGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe27a" />
          <stop offset="55%" stopColor="#f4c542" />
          <stop offset="100%" stopColor="#b8842a" />
        </linearGradient>
        <linearGradient id="trophyFlame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
      </defs>

      {/* flame wings (Ekstraklasa-style, replacing the round UCL "ears") */}
      <path
        d="M30 16 C14 20 6 34 12 46 C16 54 24 57 29 54 C21 48 18 38 22 30 C24 25 27 20 33 17 Z"
        fill="url(#trophyFlame)"
      />
      <path
        d="M70 16 C86 20 94 34 88 46 C84 54 76 57 71 54 C79 48 82 38 78 30 C76 25 73 20 67 17 Z"
        fill="url(#trophyFlame)"
      />

      {/* cup bowl - tapered chalice, no round ears */}
      <path
        d="M33 14 H67 L63 33 C63 50 57 58 50 58 C43 58 37 50 37 33 Z"
        fill="url(#trophyGold)"
      />

      {/* star emblem */}
      <path
        d="M50 24 L52.8 30.4 L59.8 31 L54.4 35.6 L56 42.4 L50 38.6 L44 42.4 L45.6 35.6 L40.2 31 L47.2 30.4 Z"
        fill="#0b1330"
        opacity="0.4"
      />

      {/* stem */}
      <path d="M45 58 H55 L53 74 H47 Z" fill="url(#trophyGold)" />

      {/* base */}
      <path d="M33 74 H67 L63 88 H37 Z" fill="url(#trophyGold)" />
      <rect x="28" y="88" width="44" height="9" rx="2.5" fill="url(#trophyGold)" />
    </svg>
  );
}
