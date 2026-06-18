interface ProgressBarProps {
  value: number
  max?: number
  color?: string
  height?: number
  showLabel?: boolean
  className?: string
  animated?: boolean
}

export function ProgressBar({ value, max = 100, color = '#0284C7', height = 6, showLabel = false, animated = true }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-stone-400 mb-1">
          <span>{value.toFixed(0)}</span>
          <span>{max}</span>
        </div>
      )}
      <div className="w-full rounded-full overflow-hidden bg-stone-100 dark:bg-stone-800" style={{ height }}>
        <div
          className={animated ? 'transition-all duration-700 ease-out' : ''}
          style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99 }}
        />
      </div>
    </div>
  )
}

interface ScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
  label?: string
  color?: string
}

export function ScoreRing({ score, size = 80, strokeWidth = 6, label, color }: ScoreRingProps) {
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const ringColor = color ?? (score >= 70 ? '#16A34A' : score >= 50 ? '#D97706' : '#DC2626')

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="var(--color-border-default)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={ringColor} strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-lg font-bold" style={{ color: ringColor }}>{score}</div>
        {label && (
          <div className="text-[9px] text-stone-400 dark:text-stone-500 uppercase tracking-wide">{label}</div>
        )}
      </div>
    </div>
  )
}
