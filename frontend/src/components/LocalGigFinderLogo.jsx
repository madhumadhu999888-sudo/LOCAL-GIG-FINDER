/** Premium bold brand mark for LocalGigFinder. */
export default function LocalGigFinderLogo({ className = "h-10 w-10 shrink-0" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <defs>
        <linearGradient id="gnLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      
      {/* Bold geometric background */}
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="12"
        fill="white"
        stroke="#1e293b"
        strokeWidth="3.5"
      />
      
      {/* Modern Location-G combined shape */}
      <path
        d="M24 12C18.477 12 14 16.477 14 22C14 28.5 24 38 24 38C24 38 34 28.5 34 22C34 16.477 29.523 12 24 12ZM24 26C21.791 26 20 24.209 20 22C20 19.791 21.791 18 24 18C26.209 18 28 19.791 28 22C28 24.209 26.209 26 24 26Z"
        fill="url(#gnLogoGrad)"
      />
      
      {/* Decorative bold accent dots */}
      <circle cx="8" cy="8" r="2.5" fill="#1e293b" />
      <circle cx="40" cy="40" r="2.5" fill="#1e293b" />
      
      {/* Secondary inner line for 'human developer' craft feel */}
      <path
        d="M38 12L41 9"
        stroke="#1e293b"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M7 41L10 38"
        stroke="#1e293b"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
