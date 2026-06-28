/** Klivo márkajel: egyszerű geometrikus SVG (önállóan használható logó). */
export default function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="1.5" y="1.5" width="29" height="29" rx="8.5" fill="url(#klivo-mark-grad)" />
      <path
        d="M11 9.5v13M11 16l7-6.5M11 16l7 6.5"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="klivo-mark-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5B6BFF" />
          <stop offset="1" stopColor="#7C4DFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}
