// Flat, pixel-grid illustrations used in feature rows and empty states.
// Everything is SVG so it scales crisply and animates cheaply with CSS.

function Pixels({ cells, size = 10, className = '' }) {
  return (
    <g className={className}>
      {cells.map(([x, y, fill], index) => (
        <rect key={index} x={x * size} y={y * size} width={size} height={size} fill={fill} />
      ))}
    </g>
  );
}

export default function PanelVisual({ scene = 'lab', className = '', label }) {
  const common = {
    viewBox: '0 0 640 440',
    role: label ? 'img' : 'presentation',
    'aria-label': label,
    className: `ef-panel ${className}`,
    preserveAspectRatio: 'xMidYMid slice',
  };

  if (scene === 'write') {
    return (
      <svg {...common}>
        <rect width="640" height="440" fill="#e0efff" />
        <g opacity="0.5" fill="#b9daff">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <rect key={i} x={i * 80} y="0" width="38" height="38" />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <rect key={`b${i}`} x={i * 120 + 40} y="402" width="52" height="38" />
          ))}
        </g>
        <rect x="118" y="64" width="360" height="264" rx="4" fill="#fbfbf8" stroke="#101013" strokeWidth="2" />
        <rect x="118" y="64" width="360" height="34" fill="#101013" />
        <circle cx="136" cy="81" r="4" fill="#fa500f" />
        <circle cx="150" cy="81" r="4" fill="#ffaf01" />
        <circle cx="164" cy="81" r="4" fill="#44ba82" />
        <rect x="140" y="124" width="206" height="14" fill="#101013" />
        <rect x="140" y="150" width="288" height="8" fill="#d3d1c9" />
        <rect x="140" y="166" width="254" height="8" fill="#d3d1c9" />
        <rect x="140" y="196" width="120" height="10" fill="#ffaf01" />
        <rect x="140" y="220" width="286" height="8" fill="#d3d1c9" />
        <rect x="140" y="236" width="268" height="8" fill="#d3d1c9" />
        <rect x="140" y="252" width="190" height="8" fill="#d3d1c9" />
        <rect className="ef-panel-caret" x="336" y="248" width="8" height="16" fill="#fa500f" />
        <g className="ef-float">
          <rect x="474" y="148" width="112" height="86" rx="3" fill="#101013" stroke="#31313a" strokeWidth="2" />
          <rect x="488" y="166" width="46" height="7" fill="#ff8204" />
          <rect x="488" y="182" width="78" height="7" fill="#6cd2a7" />
          <rect x="488" y="198" width="60" height="7" fill="#a1a1aa" />
          <rect x="488" y="214" width="70" height="7" fill="#ffaf01" />
        </g>
        <g className="ef-panel-diamond">
          <rect x="512" y="42" width="54" height="54" fill="#fa500f" transform="rotate(45 539 69)" />
        </g>
        <Pixels
          size={12}
          cells={[
            [3, 6, '#fa500f'],
            [4, 6, '#fa500f'],
            [3, 7, '#ffaf01'],
            [4, 7, '#ffaf01'],
          ]}
        />
      </svg>
    );
  }

  if (scene === 'rank') {
    return (
      <svg {...common}>
        <rect width="640" height="440" fill="#ffaf01" />
        <g opacity="0.55" fill="#ff8204">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <rect key={i} x={i * 80} y="0" width="24" height="24" />
          ))}
        </g>
        <g className="ef-panel-bars">
          <rect x="96" y="270" width="74" height="110" fill="#fbfbf8" stroke="#101013" strokeWidth="2" />
          <rect x="184" y="202" width="74" height="178" fill="#fa500f" stroke="#101013" strokeWidth="2" />
          <rect x="272" y="144" width="74" height="236" fill="#fbfbf8" stroke="#101013" strokeWidth="2" />
        </g>
        <rect x="380" y="84" width="188" height="138" rx="3" fill="#101013" />
        <text x="402" y="168" fill="#fbfbf8" fontFamily="Inter Tight, Inter, sans-serif" fontSize="66" fontWeight="500" letterSpacing="-4">
          9.2
        </text>
        <text x="404" y="194" fill="#a1a1aa" fontFamily="Space Mono, monospace" fontSize="11" letterSpacing="2">
          COMPOSITE SCORE
        </text>
        <g className="ef-panel-confetti">
          {[
            [420, 250, '#e51300'],
            [448, 286, '#fbfbf8'],
            [502, 250, '#ff8204'],
            [530, 300, '#fbfbf8'],
            [466, 322, '#e51300'],
          ].map(([x, y, fill], index) => (
            <rect key={index} x={x} y={y} width="9" height="9" fill={fill} className={`ef-confetti-${index}`} />
          ))}
        </g>
        <g className="ef-float">
          <rect x="72" y="64" width="112" height="82" rx="3" fill="#fbfbf8" stroke="#101013" strokeWidth="2" />
          <text x="88" y="106" fill="#101013" fontFamily="Space Mono, monospace" fontSize="28" fontWeight="700">
            #1
          </text>
          <rect x="88" y="118" width="58" height="6" fill="#fa500f" />
        </g>
      </svg>
    );
  }

  if (scene === 'terminal') {
    return (
      <svg {...common}>
        <rect width="640" height="440" fill="#101013" />
        <g opacity="0.4" stroke="#31313a">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <line key={i} x1="0" y1={i * 55} x2="640" y2={i * 55} />
          ))}
        </g>
        <rect x="78" y="82" width="484" height="276" rx="4" fill="#1a1a1e" stroke="#31313a" strokeWidth="2" />
        <rect x="78" y="82" width="484" height="32" fill="#27272b" />
        <circle cx="96" cy="98" r="4" fill="#e51300" />
        <circle cx="110" cy="98" r="4" fill="#ffaf01" />
        <circle cx="124" cy="98" r="4" fill="#44ba82" />
        <text x="102" y="146" fill="#44ba82" fontFamily="Space Mono, monospace" fontSize="13">
          guest@explosion.fun:~$
        </text>
        <text x="102" y="170" fill="#fbfbf8" fontFamily="Space Mono, monospace" fontSize="13">
          ls
        </text>
        <text x="102" y="194" fill="#a1a1aa" fontFamily="Space Mono, monospace" fontSize="12">
          blog&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ranked reviews
        </text>
        <text x="102" y="214" fill="#a1a1aa" fontFamily="Space Mono, monospace" fontSize="12">
          projects&nbsp;&nbsp;&nbsp;&nbsp;data toys
        </text>
        <text x="102" y="234" fill="#a1a1aa" fontFamily="Space Mono, monospace" fontSize="12">
          docs&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;build notes
        </text>
        <text x="102" y="272" fill="#44ba82" fontFamily="Space Mono, monospace" fontSize="13">
          guest@explosion.fun:~$
        </text>
        <rect className="ef-panel-caret" x="330" y="261" width="8" height="15" fill="#ffaf01" />
        <rect x="78" y="358" width="484" height="3" fill="#31313a" />
        <rect className="ef-panel-progress" x="78" y="358" width="180" height="3" fill="#fa500f" />
      </svg>
    );
  }

  if (scene === 'data') {
    return (
      <svg {...common}>
        <rect width="640" height="440" fill="#ddf8ee" />
        <g opacity="0.6" fill="#94eacc">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <rect key={i} x={i * 64} y="0" width="26" height="26" />
          ))}
        </g>
        <rect x="74" y="70" width="492" height="306" rx="3" fill="#fbfbf8" stroke="#101013" strokeWidth="2" />
        <rect x="74" y="70" width="492" height="38" fill="#f5f4ef" stroke="#101013" strokeWidth="2" />
        <rect x="96" y="84" width="112" height="9" fill="#101013" />
        <rect x="420" y="84" width="122" height="9" fill="#d3d1c9" />
        <g className="ef-panel-bars" stroke="#101013" strokeWidth="1.5">
          <rect x="106" y="262" width="42" height="80" fill="#ffaf01" />
          <rect x="162" y="230" width="42" height="112" fill="#44ba82" />
          <rect x="218" y="284" width="42" height="58" fill="#ffaf01" />
          <rect x="274" y="198" width="42" height="144" fill="#44ba82" />
          <rect x="330" y="242" width="42" height="100" fill="#ffaf01" />
          <rect x="386" y="172" width="42" height="170" fill="#44ba82" />
          <rect x="442" y="212" width="42" height="130" fill="#ffaf01" />
        </g>
        <polyline
          className="ef-panel-line"
          points="127,244 183,214 239,258 295,174 351,218 407,146 463,186"
          fill="none"
          stroke="#fa500f"
          strokeWidth="4"
          strokeLinejoin="bevel"
        />
        <g className="ef-float">
          <rect x="430" y="40" width="130" height="64" rx="3" fill="#101013" />
          <rect x="446" y="56" width="52" height="7" fill="#ff8204" />
          <rect x="446" y="72" width="84" height="7" fill="#6cd2a7" />
        </g>
      </svg>
    );
  }

  // Default: "lab" — a green board of pixel tools.
  return (
    <svg {...common}>
      <rect width="640" height="440" fill="#055737" />
      <g opacity="0.35" fill="#44ba82">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <rect key={`t${i}`} x={i * 80} y="0" width="40" height="40" />
        ))}
        {[0, 1, 2].map((i) => (
          <rect key={`b${i}`} x={i * 80 + 240} y="400" width="40" height="40" />
        ))}
      </g>
      <rect x="92" y="66" width="300" height="210" rx="3" fill="#fbfbf8" stroke="#101013" strokeWidth="2" />
      <rect x="92" y="66" width="300" height="30" fill="#101013" />
      <rect x="110" y="77" width="72" height="8" fill="#fbfbf8" />
      <g className="ef-panel-bars" stroke="#101013" strokeWidth="1.5">
        <rect x="116" y="192" width="34" height="58" fill="#ffaf01" />
        <rect x="164" y="164" width="34" height="86" fill="#ff8204" />
        <rect x="212" y="132" width="34" height="118" fill="#fa500f" />
        <rect x="260" y="180" width="34" height="70" fill="#ffaf01" />
        <rect x="308" y="112" width="34" height="138" fill="#44ba82" />
      </g>
      <g className="ef-float">
        <rect x="430" y="92" width="96" height="96" rx="3" fill="#ffaf01" stroke="#101013" strokeWidth="2" />
        <rect x="452" y="114" width="20" height="20" fill="#101013" />
        <rect x="480" y="114" width="20" height="20" fill="#101013" />
        <rect x="452" y="142" width="48" height="18" fill="#101013" />
      </g>
      <g className="ef-panel-diamond">
        <rect x="474" y="262" width="62" height="62" fill="#e51300" transform="rotate(45 505 293)" />
      </g>
      <g className="ef-float">
        <rect x="388" y="240" width="64" height="64" rx="2" fill="#0082e6" stroke="#101013" strokeWidth="2" />
        <rect x="402" y="256" width="36" height="6" fill="#fbfbf8" />
        <rect x="402" y="270" width="26" height="6" fill="#b9daff" />
        <rect x="402" y="284" width="32" height="6" fill="#b9daff" />
      </g>
      <text x="116" y="330" fill="#ddf8ee" fontFamily="Space Mono, monospace" fontSize="12" letterSpacing="2">
        EXPLOSION.FUN / LAB
      </text>
    </svg>
  );
}
