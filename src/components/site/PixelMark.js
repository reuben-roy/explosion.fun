// Pixel marks for explosion.fun.
// The 7x7 burst is drawn as SVG rects so it stays crisp at every size and can
// be recoloured by the surrounding theme.

const PALETTE = {
  y: "#ffaf01",
  t: "#ff8204",
  o: "#fa500f",
  r: "#e51300",
  d: "#c4001d",
};

// Rows are written as 7 characters. Kept explicit rather than generated so the
// mark reads the same at 16px as it does at 200px.
const MARK_ROWS = [
  ".o...o.",
  ".to.ot.",
  "oytyt yo".replace(" ", ""),
  "otydyto",
  "oytyt yo".replace(" ", ""),
  ".to.ot.",
  ".o...o.",
];

export function PixelMark({ size = 28, className = "", title = "explosion.fun" }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 7 7"
      shapeRendering="crispEdges"
      role="img"
      aria-label={title}
      focusable="false"
    >
      {MARK_ROWS.flatMap((row, y) =>
        row.split("").map((cell, x) => {
          if (cell === ".") return null;
          return (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="1"
              height="1"
              fill={PALETTE[cell] || PALETTE.o}
            />
          );
        })
      )}
    </svg>
  );
}

// A larger, more illustrative mark used in the footer and empty states.
export function PixelBurst({ size = 120, className = "", animated = true }) {
  const rows = [
    "..r...r..",
    "..o.y.o..",
    ".royy yor.".replace(" ", ""),
    "roytytyor",
    "ro tydy tor".replace(" ", ""),
    "roytytyor",
    ".royy yor.".replace(" ", ""),
    "..o.y.o..",
    "..r...r..",
  ];

  return (
    <svg
      className={`${className} ${animated ? "ef-flicker" : ""}`}
      width={size}
      height={size}
      viewBox="0 0 9 9"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {rows.flatMap((row, y) =>
        row.split("").map((cell, x) => {
          if (cell === ".") return null;
          return (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="1"
              height="1"
              fill={PALETTE[cell] || PALETTE.o}
            />
          );
        })
      )}
    </svg>
  );
}

// Mistral's pixel arrow, adapted: a diagonal staircase of blocks.
export function PixelArrow({ className = "", size = 18, direction = "up-right" }) {
  const rotations = {
    "up-right": 0,
    right: 45,
    "down-right": 90,
    down: 135,
    "down-left": 180,
    left: 225,
    "up-left": 270,
    up: 315,
  };

  return (
    <svg
      className={`ef-arrow ${className}`}
      width={size}
      height={size}
      viewBox="0 0 30 30"
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{ transform: `rotate(${rotations[direction] ?? 0}deg)` }}
    >
      <path d="M13 25H9V21H13V25Z" fill="currentColor" />
      <path d="M17 21H13V17H17V21Z" fill="currentColor" />
      <path d="M21 17H17V13H21V17Z" fill="currentColor" />
      <path d="M17 13H13V9H17V13Z" fill="currentColor" />
      <path d="M13 9H9V5H13V9Z" fill="currentColor" />
    </svg>
  );
}

// A compact pixel chevron used in menus.
export function PixelChevron({ className = "", size = 14 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 15 15"
      shapeRendering="crispEdges"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 5h2v2H4V5Zm3 3h2v2H7V8Zm3-3h2v2h-2V5Z" />
    </svg>
  );
}

export { PALETTE };
