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
      </defs>

      {/* handles */}
      <path
        d="M28 18 C12 18 9 42 27 46"
        stroke="url(#trophyGold)"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M72 18 C88 18 91 42 73 46"
        stroke="url(#trophyGold)"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />

      {/* cup bowl */}
      <path
        d="M28 14 H72 V30 C72 48 60 58 50 58 C40 58 28 48 28 30 Z"
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
