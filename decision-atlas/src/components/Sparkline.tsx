import type { ConfidenceTrendPoint } from "../lib/types";

export function Sparkline({ points }: { points: ConfidenceTrendPoint[] }) {
  if (points.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-white/5 text-sm text-slate-400">
        Save a checkpoint to see your confidence trend.
      </div>
    );
  }

  const width = 360;
  const height = 160;
  const padding = 12;
  const max = Math.max(...points.map((point) => point.value), 100);
  const min = Math.min(...points.map((point) => point.value), 0);
  const span = Math.max(max - min, 1);

  const path = points
    .map((point, index) => {
      const x =
        padding + (index / Math.max(points.length - 1, 1)) * (width - padding * 2);
      const y = height - padding - ((point.value - min) / span) * (height - padding * 2);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const area = `${path} L ${width - padding} ${height - padding} L ${padding} ${
    height - padding
  } Z`;

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full">
        <path d={area} fill="rgba(124,225,207,0.12)" />
        <path d={path} fill="none" stroke="rgba(124,225,207,0.95)" strokeWidth="3.4" />
        {points.map((point, index) => {
          const x =
            padding + (index / Math.max(points.length - 1, 1)) * (width - padding * 2);
          const y = height - padding - ((point.value - min) / span) * (height - padding * 2);
          return <circle key={`${point.createdAt}-${index}`} cx={x} cy={y} r="4.2" fill="#7ce1cf" />;
        })}
      </svg>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
        {points.map((point) => (
          <span key={`${point.label}-${point.createdAt}`} className="rounded-full bg-white/5 px-3 py-1">
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
}
