import { Star } from "lucide-react";

export default function RatingStars({ value = 0, max = 5 }) {
  const v = Math.min(max, Math.max(0, Number(value) || 0));
  return (
    <span className="inline-flex gap-0.5" aria-label={`${v} out of ${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <Star 
          key={i} 
          size={14} 
          strokeWidth={3}
          fill={i < Math.round(v) ? "currentColor" : "none"} 
          className={i < Math.round(v) ? "text-amber-500" : "text-slate-200"}
        />
      ))}
    </span>
  );
}
