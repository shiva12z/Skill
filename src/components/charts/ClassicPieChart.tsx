import React from 'react';

export interface PieSlice {
  label: string;
  value: number; // raw value; will be normalized to sum to 100
  color: string; // fill color for slice
}

interface ClassicPieChartProps {
  data: PieSlice[];
  size?: number; // px
  separatorWidth?: number; // px white separator between slices
  showLabels?: boolean; // show percentage labels inside slices
  centerText?: string; // optional center big text
  centerSubText?: string; // optional center subtitle
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = (angle - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function buildSlicePath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return [
    `M ${cx} ${cy}`,
    `L ${end.x} ${end.y}`,
    `A ${r} ${r} 0 ${largeArc} 1 ${start.x} ${start.y}`,
    'Z',
  ].join(' ');
}

export const ClassicPieChart: React.FC<ClassicPieChartProps> = ({
  data,
  size = 220,
  separatorWidth = 2,
  showLabels = true,
  centerText,
  centerSubText,
}) => {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2;

  const totalRaw = data.reduce((s, d) => s + Math.max(0, d.value), 0) || 1;
  const norm = data.map((d) => ({ ...d, pct: Math.max(0, d.value) / totalRaw }));

  // Build slices
  let angle = 0;
  const slices = norm.map((d, idx) => {
    const sweep = d.pct * 360;
    const startAngle = angle;
    const endAngle = angle + sweep;
    angle = endAngle;
    const path = buildSlicePath(cx, cy, r, startAngle, endAngle);

    // label position
    const mid = (startAngle + endAngle) / 2;
    const labelR = r * 0.6;
    const labelPos = polarToCartesian(cx, cy, labelR, mid);
    const percent = Math.round(d.pct * 100);

    return {
      key: `${d.label}-${idx}`,
      color: d.color,
      path,
      startAngle,
      endAngle,
      percent,
      label: d.label,
      labelPos,
    };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Outer white border for a clean look */}
      <circle cx={cx} cy={cy} r={r + 1} fill="#fff" />

      {/* Slices with white stroke separators */}
      {slices.map((s) => (
        <path
          key={s.key}
          d={s.path}
          fill={s.color}
          stroke="#ffffff"
          strokeWidth={separatorWidth}
        />
      ))}

      {/* Labels inside slices */}
      {showLabels && (
        <g>
          {slices.map((s) => (
            <g key={`label-${s.key}`}>
              <text
                x={s.labelPos.x}
                y={s.labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#ffffff"
                fontWeight={700}
                fontSize={14}
              >
                {s.percent}%
              </text>
              {/* Optional: small label text slightly below percent */}
              {/* <text x={s.labelPos.x} y={s.labelPos.y + 14} textAnchor="middle" fill="#ffffff" fontSize={10}>{s.label}</text> */}
            </g>
          ))}
        </g>
      )}

      {/* Center labels */}
      {centerText && (
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill="#ffffff" fontSize={20} fontWeight={800}>
          {centerText}
        </text>
      )}
      {centerSubText && (
        <text x={cx} y={cy + 18} textAnchor="middle" fill="#ffffff" fontSize={12}>
          {centerSubText}
        </text>
      )}
    </svg>
  );
};

export default ClassicPieChart;
