interface Props {
  score: number;
  max: number;
  type: "tech" | "opportunity";
}

const techColors = ["bg-red-100 text-red-700", "bg-yellow-100 text-yellow-700", "bg-green-100 text-green-700"];
const oppColors = ["bg-green-100 text-green-700", "bg-yellow-100 text-yellow-700", "bg-red-100 text-red-700"];

function colorIndex(score: number, max: number): number {
  const pct = score / max;
  if (pct < 0.34) return 0;
  if (pct < 0.67) return 1;
  return 2;
}

export function ScoreBadge({ score, max, type }: Props) {
  const colors = type === "tech" ? techColors : oppColors;
  const color = colors[colorIndex(score, max)];
  const label = type === "tech" ? "Tech" : "Oportunidad";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      {label}: {score}/{max}
    </span>
  );
}
