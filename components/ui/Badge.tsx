import { cn } from '@/lib/utils/cn'

type Variant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'violet' | 'outline'

interface BadgeProps {
  children: React.ReactNode
  variant?: Variant
  className?: string
  dot?: boolean
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-zinc-800 text-zinc-300 border border-zinc-700',
  success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  error:   'bg-red-500/15 text-red-400 border border-red-500/30',
  info:    'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  violet:  'bg-violet-500/15 text-violet-400 border border-violet-500/30',
  outline: 'bg-transparent text-zinc-400 border border-zinc-700',
}

const dotColors: Record<Variant, string> = {
  default: 'bg-zinc-400',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  error:   'bg-red-400',
  info:    'bg-blue-400',
  violet:  'bg-violet-400',
  outline: 'bg-zinc-400',
}

export function Badge({ children, variant = 'default', className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />
      )}
      {children}
    </span>
  )
}

/** Badge animado para estados "en progreso" */
export function PulseBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
        'bg-violet-500/15 text-violet-400 border border-violet-500/30',
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse shrink-0" />
      {children}
    </span>
  )
}
