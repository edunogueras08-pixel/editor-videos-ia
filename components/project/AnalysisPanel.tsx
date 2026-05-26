'use client'

import { useState } from 'react'
import { Scissors, Zap, Layout, Clock, TrendingUp, ChevronDown, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { formatDuration, formatScore } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'
import type { AnalysisResult, Highlight, SuggestedCut } from '@/lib/ai/analyzer'

interface AnalysisPanelProps {
  analysis: AnalysisResult
  onSeek?: (time: number) => void
}

type Tab = 'highlights' | 'cuts' | 'structure' | 'moments'

const TAB_CONFIG = [
  { key: 'highlights' as Tab, label: 'Highlights', icon: Zap },
  { key: 'cuts'       as Tab, label: 'Cortes sugeridos', icon: Scissors },
  { key: 'structure'  as Tab, label: 'Estructura', icon: Layout },
  { key: 'moments'    as Tab, label: 'Momentos clave', icon: TrendingUp },
]

export function AnalysisPanel({ analysis, onSeek }: AnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('highlights')

  return (
    <div className="space-y-4">
      {/* Score card */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-zinc-300">Puntuación general del vídeo</span>
          <span className="text-xl font-bold text-violet-400">{formatScore(analysis.totalScore)}</span>
        </div>
        <Progress value={analysis.totalScore * 100} color="violet" size="md" />
        <p className="text-xs text-zinc-500 mt-2">
          Basado en {analysis.highlights.length} highlights y{' '}
          {analysis.keyMoments.length} momentos clave detectados
        </p>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
        {TAB_CONFIG.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all',
                activeTab === tab.key
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:block truncate">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {activeTab === 'highlights' && (
          <HighlightsList highlights={analysis.highlights} onSeek={onSeek} />
        )}
        {activeTab === 'cuts' && (
          <CutsList cuts={analysis.suggestedCuts} onSeek={onSeek} />
        )}
        {activeTab === 'structure' && (
          <StructureView structure={analysis.structure} onSeek={onSeek} />
        )}
        {activeTab === 'moments' && (
          <MomentsList moments={analysis.keyMoments} onSeek={onSeek} />
        )}
      </div>
    </div>
  )
}

// ── HIGHLIGHTS ──────────────────────────────────────────────────────────────

function HighlightsList({
  highlights,
  onSeek,
}: {
  highlights: Highlight[]
  onSeek?: (time: number) => void
}) {
  const typeColors: Record<string, 'violet' | 'success' | 'warning' | 'info' | 'error' | 'default'> = {
    hook:       'violet',
    'key-point':'success',
    emotional:  'warning',
    funny:      'info',
    insight:    'violet',
    cta:        'error',
  }

  return (
    <div className="space-y-2">
      {highlights.map((h, i) => (
        <button
          key={i}
          onClick={() => onSeek?.(h.time)}
          className="w-full text-left rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 hover:bg-zinc-800/60 transition-all group"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md">
                {formatDuration(h.time)}
              </span>
              <Badge variant={typeColors[h.type] || 'default'}>{h.type}</Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-zinc-500 shrink-0">
              <TrendingUp className="h-3 w-3" />
              {formatScore(h.score)}
            </div>
          </div>
          <p className="text-sm font-medium text-zinc-200 mb-2">{h.label}</p>
          <Progress value={h.score * 100} size="xs" color="violet" />
          <p className="text-xs text-zinc-600 mt-2">{formatDuration(h.duration)} de duración</p>
        </button>
      ))}
    </div>
  )
}

// ── CUTS ──────────────────────────────────────────────────────────────────

function CutsList({
  cuts,
  onSeek,
}: {
  cuts: SuggestedCut[]
  onSeek?: (time: number) => void
}) {
  const priorityColors: Record<string, 'error' | 'warning' | 'default'> = {
    high:   'error',
    medium: 'warning',
    low:    'default',
  }
  const priorityLabels = { high: 'Alta', medium: 'Media', low: 'Baja' }

  const typeIcons: Record<string, string> = {
    silence:    '🔇',
    filler:     '💬',
    pause:      '⏸️',
    repetition: '🔁',
    boring:     '😴',
    error:      '⚠️',
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-zinc-500 mb-3">
        {cuts.length} segmentos sugeridos para eliminar.{' '}
        Haz clic para ir al momento en el vídeo.
      </p>
      {cuts.map((cut, i) => (
        <button
          key={i}
          onClick={() => onSeek?.(cut.startTime)}
          className="w-full text-left rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 hover:bg-zinc-800/60 transition-all"
        >
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2">
              <span>{typeIcons[cut.type] || '✂️'}</span>
              <span className="text-xs font-mono text-zinc-400">
                {formatDuration(cut.startTime)} → {formatDuration(cut.endTime)}
              </span>
            </div>
            <Badge variant={priorityColors[cut.priority] || 'default'}>
              {priorityLabels[cut.priority]}
            </Badge>
          </div>
          <p className="text-sm text-zinc-300">{cut.reason}</p>
          <p className="text-xs text-zinc-600 mt-1.5">
            Duración: {formatDuration(cut.endTime - cut.startTime)}
          </p>
        </button>
      ))}
    </div>
  )
}

// ── STRUCTURE ──────────────────────────────────────────────────────────────

function StructureView({
  structure,
  onSeek,
}: {
  structure: AnalysisResult['structure']
  onSeek?: (time: number) => void
}) {
  const sections = [
    { label: '🎯 Gancho', ...structure.hook, color: 'border-violet-500/30 bg-violet-500/5' },
    { label: '📖 Introducción', ...structure.intro, color: 'border-blue-500/30 bg-blue-500/5' },
    ...structure.development.map((d, i) => ({
      label: d.topic,
      start: d.start,
      end: d.end,
      description: undefined,
      color: 'border-zinc-700 bg-zinc-900',
    })),
    { label: '🏁 Cierre', ...structure.outro, color: 'border-emerald-500/30 bg-emerald-500/5' },
  ]

  return (
    <div className="space-y-2">
      {sections.map((s, i) => (
        <button
          key={i}
          onClick={() => onSeek?.(s.start)}
          className={cn(
            'w-full text-left rounded-xl border p-4 transition-all hover:opacity-80',
            s.color
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-zinc-200">{s.label}</span>
            <span className="text-xs font-mono text-zinc-500">
              {formatDuration(s.start)} — {formatDuration(s.end)}
            </span>
          </div>
          {s.description && (
            <p className="text-xs text-zinc-500">{s.description}</p>
          )}
        </button>
      ))}
    </div>
  )
}

// ── KEY MOMENTS ──────────────────────────────────────────────────────────────

function MomentsList({
  moments,
  onSeek,
}: {
  moments: AnalysisResult['keyMoments']
  onSeek?: (time: number) => void
}) {
  return (
    <div className="space-y-2">
      {moments.map((m, i) => (
        <button
          key={i}
          onClick={() => onSeek?.(m.time)}
          className="w-full text-left rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-violet-400 bg-violet-500/10 px-2 py-1 rounded-md shrink-0">
              {formatDuration(m.time)}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate">{m.text}</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Palabra clave:{' '}
                <span className="text-violet-400">#{m.keyword}</span>
              </p>
            </div>
            <Badge variant={m.importance === 'high' ? 'violet' : 'default'}>
              {m.importance === 'high' ? 'Alta' : 'Media'}
            </Badge>
          </div>
        </button>
      ))}
    </div>
  )
}
