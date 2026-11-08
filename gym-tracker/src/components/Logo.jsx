// Logo appki jako komponent - ten sam rysunek co ikona na ekranie głównym.
function Logo({ size = 64 }) {
  return (
    <svg className="logo" width={size} height={size} viewBox="0 0 1024 1024" role="img" aria-label="Ławka 120">
      <defs>
        <linearGradient id="logo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#23b862" />
          <stop offset="1" stopColor="#0c6331" />
        </linearGradient>
      </defs>
      <rect width="1024" height="1024" rx="230" fill="url(#logo-bg)" />
      <g fill="#c9f7da">
        <circle cx="508" cy="618" r="13" />
        <circle cx="492" cy="572" r="13" />
        <circle cx="482" cy="524" r="13" />
        <circle cx="480" cy="476" r="13" />
        <circle cx="486" cy="428" r="13" />
      </g>
      <circle cx="512" cy="300" r="128" fill="#f4fff8" />
      <circle cx="512" cy="300" r="92" fill="none" stroke="#1a9a4f" strokeWidth="10" opacity=".35" />
      <circle cx="512" cy="300" r="36" fill="#128043" />
      <rect x="228" y="684" width="568" height="64" rx="32" fill="#f4fff8" />
      <rect x="300" y="740" width="38" height="128" rx="14" fill="#f4fff8" />
      <rect x="686" y="740" width="38" height="128" rx="14" fill="#f4fff8" />
    </svg>
  );
}

export default Logo;
