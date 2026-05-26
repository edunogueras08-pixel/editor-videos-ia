'use client'

import { useState } from 'react'
import {
  Play, Download, Clock, TrendingUp, Smartphone,
  Monitor, Subtitles, ZoomIn, Loader2, CheckCircle2, XCircle
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { formatDuration, formatScore, PLATFORM_INFO } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'

interface Clip {
  id: string
  title: string
  description?: string | null
  startTime: number
  endTime: number
  duration: number
  reason?: string | null
  score: number
  format: string
  status: string
  outputPath?: string | null
  hasSubtitles: boolean
  hasZoom: boolean
  platform: string
}

interface ClipCardProps {
  clip: Clip
  projectId: string
  onExport?: (clipId: string) => void
  onPreview?: (clip: Clip) => void
}

export function ClipCard({ clip, projectId, onExport, onPreview }: ClipCardProps) {
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [exported, setExported] = useState(clip.status === 'ready')
  const [error, setError] = useState<string | null>(null)

  const platformInfo = PLATFORM_INFO[clip.platform]
  const scorePercent = Math.round(clip.score * 100)

  async function handleExport() {
    if (exporting || exported) return
    setExporting(true)
    setError(null)

    try {
      // Simular progreso
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 95) { clearInterval(interval); return p }
          return p + Math.random() * 12
        })
      }, 500)

      const res = await fetch(`/api/projects/${projectId}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clipId: clip.id, type: 'clip' }),
      })

      clearInterval(interval)
      setProgress(100)

      if (!res.ok) throw new Error('Error al exportar')

      setTimeout(() => {
        setExporting(false)
        setExported(true)
        onExport?.(clip.id)
      }, 500)
    } catch (err) {
      setExporting(false)
      setProgress(0)
      setError('Error al exportar el clip')
    }
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-all',
        exporting && 'border-violet-500/30',
        exported && 'border-emerald-500/30'
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Viral score */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700">
          <span className={cn(
            'text-base font-bold leading-none',
            scorePercent >= 80 ? 'text-emerald-400' :
            scorePercent >= 60 ? 'text-amber-400' : 'text-zinc-400'
          )}>
            {scorePercent}
          </span>
          <span className="text-[10px] text-zinc-600 mt-0.5">viral</span>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-zinc-100 leading-snug line-clamp-2 mb-1">
            {clip.title}
          </h4>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-zinc-500">
              <Clock className="h-3 w-3" />
              {formatDuration(clip.duration)}
            </span>
            <span className={cn('text-xs font-medium', platformInfo?.color || 'text-zinc-400')}>
              {platformInfo?.label || clip.platform}
            </span>
          </div>
        </div>

        {/* Format badge */}
        <div className="shrink-0">
          {clip.format === 'vertical' ? (
            <Smartphone className="h-4 w-4 text-zinc-500" />
          ) : (
            <Monitor className="h-4 w-4 text-zinc-500" />
          )}
        </div>
      </div>

      {/* Reason */}
      {clip.reason && (
        <p className="text-xs text-zinc-500 mb-3 leading-relaxed border-l-2 border-zinc-700 pl-3">
          {clip.reason}
        </p>
      )}

      {/* Features row */}
      <div className="flex items-center gap-2 mb-4">
        <span className={cn(
          'flex items-center gap-1 text-xs px-2 py-1 rounded-md border',
          clip.hasSubtitles
            ? 'text-violet-400 bg-violet-500/10 border-violet-500/20'
            : 'text-zinc-600 bg-zinc-800 border-zinc-700'
        )}>
          <Subtitles className="h-3 w-3" />
          Subtítulos
        </span>
        <span className={cn(
          'flex items-center gap-1 text-xs px-2 py-1 rounded-md border',
          clip.hasZoom
            ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
            : 'text-zinc-600 bg-zinc-800 border-zinc-700'
        )}>
          <ZoomIn className="h-3 w-3" />
          Zoom
        </span>
        <span className="text-xs text-zinc-600 ml-auto font-mono">
          {formatDuration(clip.startTime)} → {formatDuration(clip.endTime)}
        </span>
      </div>

      {/* Progress bar when exporting */}
      {exporting && (
        <div className="mb-3">
          <Progress value={progress} size="sm" color="violet" label="Generando clip..." showLabel animated />
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 mb-3 flex items-center gap-1">
          <XCircle className="h-3.5 w-3.5" /> {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          icon={<Play className="h-3.5 w-3.5" fill="currentColor" />}
          onClick={() => onPreview?.(clip)}
          className="flex-1"
        >
          Previsualizar
        </Button>

        {exported ? (
          <Button
            variant="secondary"
            size="sm"
            icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
            className="flex-1"
          >
            Exportado
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            icon={
              exporting
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <Download className="h-3.5 w-3.5" />
            }
            onClick={handleExport}
            loading={exporting}
            className="flex-1"
          >
            {exporting ? 'Exportando...' : 'Exportar clip'}
          </Button>
        )}
      </div>
    </div>
  )
}
