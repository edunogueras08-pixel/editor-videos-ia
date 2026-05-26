'use client'

import { cn } from '@/lib/utils/cn'
import { STYLE_INFO } from '@/lib/utils/formatters'

interface StyleSelectorProps {
  value: string
  onChange: (style: string) => void
  disabled?: boolean
}

export function StyleSelector({ value, onChange, disabled }: StyleSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {Object.entries(STYLE_INFO).map(([key, info]) => {
        const isSelected = value === key

        return (
          <button
            key={key}
            type="button"
            disabled={disabled}
            onClick={() => onChange(key)}
            className={cn(
              'text-left rounded-xl border p-4 transition-all duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isSelected
                ? 'border-violet-500 bg-violet-500/10 card-glow'
                : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800/60'
            )}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">{info.icon}</span>
              <span
                className={cn(
                  'text-sm font-semibold transition-colors',
                  isSelected ? 'text-violet-300' : 'text-zinc-200'
                )}
              >
                {info.label}
              </span>
              {isSelected && (
                <span className="ml-auto text-violet-400">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              )}
            </div>
            <p
              className={cn(
                'text-xs leading-relaxed transition-colors',
                isSelected ? 'text-zinc-400' : 'text-zinc-500'
              )}
            >
              {info.desc}
            </p>
          </button>
        )
      })}
    </div>
  )
}
