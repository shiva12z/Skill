import React from 'react';

interface PieSegment {
  label: string;
  value: number; // 0-100 aggregate sum should be <= 100
  color: string; // hex color, e.g., #10B981
}

interface PieChartProps {
  data: PieSegment[];
  size?: number; // px
  thickness?: number; // px for donut thickness
  legend?: boolean;
  normalize?: boolean; // if true, values are normalized to sum to 100%
  centerText?: string | number; // optional main text in center
  centerSubText?: string; // optional sub text in center
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  size = 180,
  thickness = 22,
  legend = true,
  normalize = true,
  centerText,
  centerSubText,
}) => {
  const radius = size / 2 - 2;
  const circumference = 2 * Math.PI * radius;

  const sumRaw = data.reduce((sum, d) => sum + Math.max(0, d.value), 0);
  const safeSum = sumRaw > 0 ? sumRaw : 1;

  // If normalize, compute proportions based on raw sum so the ring always covers 100%
  // Otherwise, proportions are based on provided values but still constrained to the total.
  const proportions = data.map((d) => {
    const p = Math.max(0, d.value) / safeSum;
    return isFinite(p) ? p : 0;
  });

  // Build segments with cumulative offsets
  let cumulative = 0;
  const segments = data.map((d, idx) => {
    const proportion = normalize ? proportions[idx] : Math.max(0, d.value) / Math.max(1, sumRaw);
    const length = proportion * circumference;
    const dasharray = `${length} ${circumference - length}`;
    const dashoffset = circumference - cumulative * circumference;
    cumulative += proportion;
    return { ...d, proportion, dasharray, dashoffset, key: `${d.label}-${idx}` };
  });

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#E5E7EB"
            strokeWidth={thickness}
          />
          {segments.map((s) => (
            <circle
              key={s.key}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={s.dasharray}
              strokeDashoffset={s.dashoffset}
              strokeLinecap="butt"
            />
          ))}
        </g>
        {/* Center labels */}
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-gray-900" fontSize={18} fontWeight={700}>
          {centerText !== undefined ? String(centerText) : '100%'}
        </text>
        {centerSubText && (
          <text x="50%" y={size / 2 + 18} textAnchor="middle" className="fill-gray-500" fontSize={12}>
            {centerSubText}
          </text>
        )}
      </svg>

      {legend && (
        <div className="space-y-2">
          {segments.map((s, idx) => (
            <div key={`${s.label}-legend-${idx}`} className="flex items-center gap-2 text-sm text-gray-700">
              <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: s.color }} />
              <span className="font-medium">{s.label}</span>
              <span className="text-gray-500">{Math.round(s.proportion * 100)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PieChart;
