interface ProgressBarProps {
  value: number
  max?: number
  color?: string
  height?: number
  showLabel?: boolean
  className?: string
  animated?: boolean
}

export function ProgressBar({ value, max = 100, color = '#3b82f6', height = 6, showLabel = false, animated = true }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-[#64748b] mb-1">
          <span>{value.toFixed(0)}</span>
          <span>{max}</span>
        </div>
      )}
      <div className="w-full rounded-full overflow-hidden" style={{ height, background: 'rgba(255,255,255,0.06)' }}>
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
  const ringColor = color ?? (score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444')

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
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
        {label && <div className="text-[9px] text-[#64748b] uppercase tracking-wide">{label}</div>}
      </div>
    </div>
  )
}
