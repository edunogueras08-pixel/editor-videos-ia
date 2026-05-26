import { cn } from '@/lib/utils/cn'

interface ProgressProps {
  value: number        // 0-100
  className?: string
  color?: 'violet' | 'emerald' | 'amber' | 'red' | 'blue'
  size?: 'xs' | 'sm' | 'md'
  showLabel?: boolean
  label?: string
  animated?: boolean
}

const colorClasses = {
  violet:  'bg-violet-500',
  emerald: 'bg-emerald-500',
  amber:   'bg-amber-500',
  red:     'bg-red-500',
  blue:    'bg-blue-500',
}

const sizeClasses = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2',
}

export function Progress({
  value,
  className,
  color = 'violet',
  size = 'sm',
  showLabel = false,
  label,
  animated = false,
}: ProgressProps) {
  const clampedValue = Math.max(0, Math.min(100, value))

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-zinc-400">{label}</span>}
          {showLabel && (
            <span className="text-xs text-zinc-400 ml-auto">{clampedValue}%</span>
          )}
        </div>
      )}
      <div className={cn('w-full bg-zinc-800 rounded-full overflow-hidden', sizeClasses[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorClasses[color],
            animated && 'animate-pulse'
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  )
}

/** Progress circular para estados de carga */
export function CircularProgress({
  size = 32,
  strokeWidth = 3,
  className,
}: {
  size?: number
  strokeWidth?: number
  className?: string
}) {
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn('animate-spin', className)}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeOpacity={0.2}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#8b5cf6"
        strokeWidth={strokeWidth}
        strokeDasharray={circ}
        strokeDashoffset={circ * 0.75}
        strokeLinecap="round"
      />
    </svg>
  )
}
