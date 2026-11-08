import styles from './FencingScene.module.css';

const SPRITE = {
  k: '#101013',
  w: '#fbfbf8',
  o: '#fa500f',
  g: '#9a9aa4',
};

// The original 14 x 15 en-garde fencer, facing right. The foil is drawn
// separately so it can parry independently while the body lunges.
const FENCER_ROWS = [
  '......kkkk....',
  '.....kwwwwk...',
  '.....kwggwk...',
  '.....kwwwwk...',
  '......kwwk....',
  '.....kwwwwk...',
  '....kwwwwwwk..',
  '...kwwwwwwwwk.',
  '..kwwkwwwwwwok',
  '..kk.kwwwwwwk.',
  '......kwwk....',
  '.....kwwk.....',
  '....kwwk..kwk.',
  '...kwwk....kwk',
  '..kkk......kkk',
];

function Sprite({ mirrored = false }) {
  const transform = mirrored
    ? 'translate(224 30) scale(-4 4)'
    : 'translate(16 30) scale(4)';

  return (
    <g transform={transform} shapeRendering="crispEdges">
      {FENCER_ROWS.flatMap((row, y) =>
        row.split('').map((cell, x) => {
          if (cell === '.') return null;
          return (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="1"
              height="1"
              fill={SPRITE[cell] || SPRITE.k}
            />
          );
        })
      )}
      <g className={styles.blade}>
        <rect x="12.5" y="6.6" width="1.1" height="2.8" fill={SPRITE.o} />
        <rect x="12.8" y="7.4" width="0.5" height="1.2" fill={SPRITE.k} />
        <rect x="13" y="7.6" width="10.6" height="0.8" fill={SPRITE.k} />
        <rect x="13" y="7.85" width="10.2" height="0.3" fill="#f2efe4" />
      </g>
    </g>
  );
}

function Spark({ at, className }) {
  return (
    <g transform={`translate(${at[0]} ${at[1]})`}>
      <g className={`${styles.spark} ${className}`.trim()}>
        <rect x="-1" y="-10" width="2" height="5" fill="#fff4d2" />
        <rect x="-1" y="5" width="2" height="5" fill="#fff4d2" />
        <rect x="-10" y="-1" width="5" height="2" fill="#ffaf01" />
        <rect x="5" y="-1" width="5" height="2" fill="#ffaf01" />
        <rect x="-7" y="-7" width="2" height="2" fill="#fa500f" />
        <rect x="5" y="-7" width="2" height="2" fill="#fa500f" />
        <rect x="-7" y="5" width="2" height="2" fill="#fa500f" />
        <rect x="5" y="5" width="2" height="2" fill="#fa500f" />
        <rect x="-2" y="-2" width="4" height="4" fill="#fbfbf8" />
        <rect x="-1" y="-1" width="2" height="2" fill="#ffaf01" />
      </g>
    </g>
  );
}

/**
 * Two pixel fencers duel above the footer bands. Decorative, so it stays out of
 * the accessibility tree and respects prefers-reduced-motion through the global
 * reset.
 */
export default function FencingScene({ className = '' }) {
  return (
    <svg
      className={`${styles.scene} ${className}`.trim()}
      viewBox="0 0 240 100"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <g>
        <rect x="14" y="90.8" width="212" height="2.4" fill="#101013" opacity="0.45" />
        <rect x="14" y="90" width="212" height="1.6" fill="#fbfbf8" opacity="0.92" />
        <rect x="116" y="92.8" width="8" height="1" fill="#fbfbf8" opacity="0.55" />
        <rect x="22" y="92.8" width="2" height="1" fill="#fbfbf8" opacity="0.4" />
        <rect x="216" y="92.8" width="2" height="1" fill="#fbfbf8" opacity="0.4" />
      </g>

      <g className={`${styles.fencer} ${styles.left}`}>
        <g className={styles.bob}>
          <Sprite />
        </g>
      </g>

      <g className={`${styles.fencer} ${styles.right}`}>
        <g className={styles.bob}>
          <Sprite mirrored />
        </g>
      </g>

      <Spark at={[142, 62]} className={styles.sparkFirst} />
      <Spark at={[98, 62]} className={styles.sparkSecond} />
    </svg>
  );
}
