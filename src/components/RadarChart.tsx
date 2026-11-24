import { CRITERION_ORDER, CriterionScore } from '../types';
import { CRITERION_STYLES } from '../constants/criteria';

interface RadarChartProps {
  scores: CriterionScore[];
  compareScores?: CriterionScore[];
  primaryLabel?: string;
  compareLabel?: string;
}

const AXES = [
  { key: CRITERION_ORDER[0], label: 'Relevance', angleDeg: -90 },
  { key: CRITERION_ORDER[1], label: 'Clarity & Structure', angleDeg: 0 },
  { key: CRITERION_ORDER[2], label: 'Reasoning', angleDeg: 90 },
  { key: CRITERION_ORDER[3], label: 'Specific Examples', angleDeg: 180 },
];

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

function buildPolygonPoints(
  scores: CriterionScore[],
  cx: number,
  cy: number,
  maxR: number
): string {
  return AXES.map((axis) => {
    const match = scores.find((s) => s.criterion === axis.key);
    const val = match ? Math.min(5, Math.max(0, match.score)) : 0;
    const r = (val / 5) * maxR;
    const pt = polarToCartesian(cx, cy, r, axis.angleDeg);
    return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
  }).join(' ');
}

export function RadarChart({
  scores,
  compareScores,
  primaryLabel = 'Current',
  compareLabel = 'Before',
}: RadarChartProps) {
  const size = 290;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 82;

  const primaryPoints = buildPolygonPoints(scores, cx, cy, maxR);
  const comparePoints = compareScores ? buildPolygonPoints(compareScores, cx, cy, maxR) : null;

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[290px] overflow-visible"
        role="img"
        aria-label="Criterion scores radar chart from 1 to 5"
      >
        {/* Concentric diamonds for levels 1..5 */}
        {[1, 2, 3, 4, 5].map((level) => {
          const r = (level / 5) * maxR;
          const pts = AXES.map((a) => {
            const p = polarToCartesian(cx, cy, r, a.angleDeg);
            return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
          }).join(' ');
          return (
            <polygon
              key={level}
              points={pts}
              fill={level === 5 ? 'rgba(255, 255, 255, 0.03)' : 'none'}
              stroke={level === 5 ? 'rgba(103, 232, 249, 0.28)' : 'rgba(255, 255, 255, 0.12)'}
              strokeWidth={level === 5 ? 1.25 : 1}
            />
          );
        })}

        {/* Axis lines */}
        {AXES.map((axis) => {
          const end = polarToCartesian(cx, cy, maxR, axis.angleDeg);
          return (
            <line
              key={axis.key}
              x1={cx}
              y1={cy}
              x2={end.x}
              y2={end.y}
              stroke="rgba(255, 255, 255, 0.16)"
              strokeWidth={1}
            />
          );
        })}

        {/* Ring scale labels along top axis */}
        {[1, 3, 5].map((level) => {
          const y = cy - (level / 5) * maxR;
          return (
            <text
              key={level}
              x={cx + 5}
              y={y + 3}
              className="fill-slate-400 text-[9px] font-mono-tabular"
            >
              {level}
            </text>
          );
        })}

        {/* Optional Before comparison polygon */}
        {comparePoints && (
          <polygon
            points={comparePoints}
            fill="rgba(167, 139, 250, 0.14)"
            stroke="#A78BFA"
            strokeWidth={1.75}
            strokeDasharray="4 3"
          />
        )}

        {/* Primary polygon */}
        <polygon
          points={primaryPoints}
          fill="rgba(61, 219, 166, 0.22)"
          stroke="#3DDBA6"
          strokeWidth={2.5}
        />

        {/* Vertex dots */}
        {AXES.map((axis) => {
          const match = scores.find((s) => s.criterion === axis.key);
          const val = match ? Math.min(5, Math.max(0, match.score)) : 0;
          const pt = polarToCartesian(cx, cy, (val / 5) * maxR, axis.angleDeg);
          const style = CRITERION_STYLES[axis.key];
          return (
            <circle
              key={axis.key}
              cx={pt.x}
              cy={pt.y}
              r={4.5}
              fill={style.neonHex}
              stroke="#0B0A16"
              strokeWidth={1.5}
            />
          );
        })}

        {/* Axis Labels */}
        {AXES.map((axis) => {
          const match = scores.find((s) => s.criterion === axis.key);
          const scoreText = match ? match.score.toFixed(match.score % 1 === 0 ? 0 : 1) : '0';
          const labelPt = polarToCartesian(cx, cy, maxR + 24, axis.angleDeg);
          const textAnchor =
            axis.angleDeg === 0 ? 'start' : axis.angleDeg === 180 ? 'end' : 'middle';
          const dy = axis.angleDeg === -90 ? -4 : axis.angleDeg === 90 ? 10 : 3;
          const style = CRITERION_STYLES[axis.key];

          return (
            <g key={axis.key}>
              <text
                x={labelPt.x}
                y={labelPt.y + dy}
                textAnchor={textAnchor}
                className="fill-[#E6EDF7] text-[11px] font-semibold"
              >
                {axis.label}
              </text>
              <text
                x={labelPt.x}
                y={labelPt.y + dy + 13}
                textAnchor={textAnchor}
                fill={style.neonHex}
                className="text-[10px] font-mono-tabular font-bold"
              >
                {scoreText}/5
              </text>
            </g>
          );
        })}
      </svg>

      {compareScores && (
        <div className="mt-3 flex items-center gap-5 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-[#A78BFA]" />
            <span>{compareLabel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 bg-[#3DDBA6]" />
            <span className="font-semibold text-[#E6EDF7]">{primaryLabel}</span>
          </div>
        </div>
      )}
    </div>
  );
}
