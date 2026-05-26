'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Sparkles, Film, Scissors, Music2,
  Download, RefreshCw, AlertCircle, Clock, Info,
} from 'lucide-react'
import { VideoPlayer } from '@/components/project/VideoPlayer'
import { AnalysisPanel } from '@/components/project/AnalysisPanel'
import { ClipCard } from '@/components/project/ClipCard'
import { MusicSection } from '@/components/project/MusicSection'
import { StyleSelector } from '@/components/project/StyleSelector'
import { Button } from '@/components/ui/Button'
import { Badge, PulseBadge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import {
  formatDurationVerbose,
  formatFileSize,
  formatRelativeDate,
  PROJECT_STATUS_LABELS,
  STYLE_INFO,
} from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'
import type { AnalysisResult } from '@/lib/ai/analyzer'

// ─── Types ──────────────────────────────────────────────────────────────────

interface Project {
  id: string
  name: string
  description?: string | null
  status: string
  duration?: number | null
  videoPath?: string | null
  videoName?: string | null
  videoSize?: number | null
  thumbnail?: string | null
  style: string
  styleRef?: string | null
  musicId?: string | null
  createdAt: string
  updatedAt: string
  analysis?: AnalysisResult & {
    id: string
    createdAt: string
    wordCount?: number | null
    transcript?: string | null
  } | null
  clips: Array<{
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
  }>
  exports: Array<{
    id: string
    type: string
    clipId?: string | null
    format: string
    resolution: string
    status: string
    outputPath?: string | null
    fileSize?: number | null
    duration?: number | null
    progress: number
    createdAt: string
  }>
  music?: {
    id: string
    name: string
    artist?: string | null
    tone: string
    duration?: number | null
    filePath: string
  } | null
}

// ─── Tabs ────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'analysis' | 'clips' | 'music' | 'export'

const TABS: Array<{ key: Tab; label: string; icon: React.ElementType }> = [
  { key: 'overview',  label: 'Resumen',     icon: Film },
  { key: 'analysis',  label: 'Análisis IA', icon: Sparkles },
  { key: 'clips',     label: 'Clips',       icon: Scissors },
  { key: 'music',     label: 'Música',      icon: Music2 },
  { key: 'export',    label: 'Exportar',    icon: Download },
]

// ─── Main component ──────────────────────────────────────────────────────────

export function ProjectWorkspace({ project: initialProject }: { project: Project }) {
  const [project, setProject] = useState(initialProject)
  const [tab, setTab] = useState<Tab>('overview')
  const [seekTime, setSeekTime] = useState<number | undefined>()
  const [analyzing, setAnalyzing] = useState(false)
  const [generatingClips, setGeneratingClips] = useState(false)
  const [exportingLong, setExportingLong] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [musicVolume, setMusicVolume] = useState(0.15)
  const [musicEnabled, setMusicEnabled] = useState(true)
  const [styleRef, setStyleRef] = useState(project.styleRef || '')
  const [error, setError] = useState<string | null>(null)

  const hasAnalysis = !!project.analysis
  const hasClips    = project.clips.length > 0
  const isProcessing = ['analyzing', 'editing', 'exporting'].includes(project.status)

  // ── Analyze ──────────────────────────────────────────────────────────────

  async function handleAnalyze() {
    setAnalyzing(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${project.id}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ style: project.style, styleRef }),
      })
      if (!res.ok) throw new Error('Error al analizar')
      const data = await res.json()
      setProject(p => ({ ...p, status: 'analyzed', analysis: data.analysis }))
      setTab('analysis')
    } catch (err) {
      setError('Error al analizar el vídeo. Inténtalo de nuevo.')
    } finally {
      setAnalyzing(false)
    }
  }

  // ── Generate clips ───────────────────────────────────────────────────────

  async function handleGenerateClips() {
    setGeneratingClips(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${project.id}/clips`, { method: 'POST' })
      if (!res.ok) throw new Error('Error al generar clips')
      const data = await res.json()
      setProject(p => ({ ...p, clips: data.clips }))
      setTab('clips')
    } catch (err) {
      setError('Error al generar clips. Inténtalo de nuevo.')
    } finally {
      setGeneratingClips(false)
    }
  }

  // ── Export long video ────────────────────────────────────────────────────

  async function handleExportLong() {
    setExportingLong(true)
    setExportProgress(0)
    setError(null)

    const interval = setInterval(() => {
      setExportProgress(p => {
        if (p >= 95) { clearInterval(interval); return p }
        return p + Math.random() * 8
      })
    }, 600)

    try {
      const res = await fetch(`/api/projects/${project.id}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'long', resolution: '1080p' }),
      })
      clearInterval(interval)
      setExportProgress(100)
      if (!res.ok) throw new Error('Error al exportar')
      const data = await res.json()
      setProject(p => ({ ...p, exports: [data.export, ...p.exports] }))
      setTab('export')
    } catch (err) {
      clearInterval(interval)
      setError('Error al exportar. Inténtalo de nuevo.')
    } finally {
      setTimeout(() => {
        setExportingLong(false)
        setExportProgress(0)
      }, 1000)
    }
  }

  // ── Style update ─────────────────────────────────────────────────────────

  async function handleStyleChange(newStyle: string) {
    setProject(p => ({ ...p, style: newStyle }))
    await fetch(`/api/projects/${project.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ style: newStyle }),
    })
  }

  const styleInfo = STYLE_INFO[project.style]

  return (
    <div className="flex flex-col h-full">
      {/* ─── Top bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-zinc-800 bg-zinc-950">
        <Link
          href="/projects"
          className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Proyectos
        </Link>
        <span className="text-zinc-700">/</span>
        <h1 className="text-sm font-semibold text-zinc-200 truncate flex-1">{project.name}</h1>

        <div className="flex items-center gap-2 shrink-0">
          {isProcessing ? (
            <PulseBadge>{PROJECT_STATUS_LABELS[project.status]}</PulseBadge>
          ) : (
            <Badge
              variant={
                project.status === 'analyzed' || project.status === 'done' ? 'success' :
                project.status === 'error' ? 'error' : 'default'
              }
              dot
            >
              {PROJECT_STATUS_LABELS[project.status] || project.status}
            </Badge>
          )}
        </div>
      </div>

      {/* ─── Error banner ────────────────────────────────────────────────── */}
      {error && (
        <div className="mx-6 mt-4 flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">✕</button>
        </div>
      )}

      {/* ─── Main layout ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: video + actions */}
        <div className="w-[420px] flex-shrink-0 border-r border-zinc-800 flex flex-col overflow-y-auto">
          <div className="p-5 space-y-4">
            {/* Video player */}
            {project.videoPath ? (
              <VideoPlayer
                src={project.videoPath}
                poster={project.thumbnail || undefined}
                onTimeUpdate={t => setSeekTime(t)}
                markers={
                  project.analysis?.highlights?.map(h => ({
                    time: h.time,
                    color: '#a78bfa',
                    label: h.label,
                  })) || []
                }
              />
            ) : (
              <div className="aspect-video rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <Film className="h-10 w-10 text-zinc-600" />
              </div>
            )}

            {/* Video info */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {project.duration && (
                <div className="rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2">
                  <p className="text-zinc-500 mb-0.5">Duración</p>
                  <p className="font-medium text-zinc-200">{formatDurationVerbose(project.duration)}</p>
                </div>
              )}
              {project.videoSize && (
                <div className="rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2">
                  <p className="text-zinc-500 mb-0.5">Tamaño</p>
                  <p className="font-medium text-zinc-200">{formatFileSize(project.videoSize)}</p>
                </div>
              )}
              <div className="rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2">
                <p className="text-zinc-500 mb-0.5">Clips</p>
                <p className="font-medium text-zinc-200">{project.clips.length}</p>
              </div>
              <div className="rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2">
                <p className="text-zinc-500 mb-0.5">Exportaciones</p>
                <p className="font-medium text-zinc-200">{project.exports.length}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              <Button
                variant="primary"
                className="w-full"
                icon={<Sparkles className="h-4 w-4" />}
                onClick={handleAnalyze}
                loading={analyzing}
                disabled={isProcessing}
              >
                {hasAnalysis ? 'Re-analizar con IA' : 'Analizar con IA'}
              </Button>

              <Button
                variant="secondary"
                className="w-full"
                icon={<Film className="h-4 w-4" />}
                onClick={handleExportLong}
                loading={exportingLong}
                disabled={!hasAnalysis || isProcessing}
              >
                Generar edición larga
              </Button>

              {exportingLong && (
                <Progress value={exportProgress} size="sm" color="violet" animated label="Generando edición..." showLabel />
              )}

              <Button
                variant="outline"
                className="w-full"
                icon={<Scissors className="h-4 w-4" />}
                onClick={handleGenerateClips}
                loading={generatingClips}
                disabled={!hasAnalysis || isProcessing}
              >
                {hasClips ? 'Regenerar clips' : 'Generar clips cortos'}
              </Button>
            </div>

            {/* Style info */}
            {styleInfo && (
              <div className="flex items-start gap-2 rounded-lg bg-zinc-900/60 border border-zinc-800 p-3 text-xs">
                <span>{styleInfo.icon}</span>
                <div>
                  <p className="font-medium text-zinc-300">{styleInfo.label}</p>
                  <p className="text-zinc-500 mt-0.5 leading-relaxed">{styleInfo.desc}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: tabs */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab bar */}
          <div className="flex items-center gap-1 px-6 pt-4 pb-0 border-b border-zinc-800">
            {TABS.map(t => {
              const Icon = t.icon
              const active = tab === t.key
              const hasContent =
                (t.key === 'analysis' && hasAnalysis) ||
                (t.key === 'clips' && hasClips) ||
                t.key === 'overview' ||
                t.key === 'music' ||
                t.key === 'export'

              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all',
                    active
                      ? 'border-violet-500 text-violet-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {t.label}
                  {t.key === 'clips' && hasClips && (
                    <span className="ml-1 text-xs bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-full">
                      {project.clips.length}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
            {/* ── OVERVIEW ── */}
            {tab === 'overview' && (
              <OverviewTab
                project={project}
                styleRef={styleRef}
                onStyleRefChange={setStyleRef}
                onStyleChange={handleStyleChange}
              />
            )}

            {/* ── ANALYSIS ── */}
            {tab === 'analysis' && (
              <>
                {hasAnalysis ? (
                  <AnalysisPanel
                    analysis={project.analysis!}
                    onSeek={t => {
                      setSeekTime(t)
                    }}
                  />
                ) : (
                  <EmptyTab
                    icon={<Sparkles className="h-8 w-8 text-zinc-600" />}
                    title="Sin análisis todavía"
                    desc="Pulsa «Analizar con IA» para detectar highlights, cortes sugeridos y la estructura del vídeo."
                  />
                )}
              </>
            )}

            {/* ── CLIPS ── */}
            {tab === 'clips' && (
              <>
                {hasClips ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-zinc-400">
                        {project.clips.length} clips detectados · formato vertical 9:16
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<RefreshCw className="h-3.5 w-3.5" />}
                        onClick={handleGenerateClips}
                        loading={generatingClips}
                      >
                        Regenerar
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {project.clips.map(clip => (
                        <ClipCard
                          key={clip.id}
                          clip={clip}
                          projectId={project.id}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <EmptyTab
                    icon={<Scissors className="h-8 w-8 text-zinc-600" />}
                    title="Sin clips generados"
                    desc="Primero analiza el vídeo con IA, luego pulsa «Generar clips cortos»."
                  />
                )}
              </>
            )}

            {/* ── MUSIC ── */}
            {tab === 'music' && (
              <MusicSection
                musicLibrary={[]} // Se cargará dinámicamente
                selectedMusicId={project.musicId}
                onSelect={async (id) => {
                  setProject(p => ({ ...p, musicId: id }))
                  await fetch(`/api/projects/${project.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ musicId: id }),
                  })
                }}
                musicVolume={musicVolume}
                onVolumeChange={setMusicVolume}
                musicEnabled={musicEnabled}
                onToggleMusic={setMusicEnabled}
              />
            )}

            {/* ── EXPORT ── */}
            {tab === 'export' && (
              <ExportTab
                exports={project.exports}
                onExportLong={handleExportLong}
                exporting={exportingLong}
                progress={exportProgress}
                hasAnalysis={hasAnalysis}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Overview tab ────────────────────────────────────────────────────────────

function OverviewTab({
  project,
  styleRef,
  onStyleRefChange,
  onStyleChange,
}: {
  project: Project
  styleRef: string
  onStyleRefChange: (v: string) => void
  onStyleChange: (s: string) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">Estilo de edición</h3>
        <StyleSelector value={project.style} onChange={onStyleChange} />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm font-semibold text-zinc-200">Referencia de estilo</h3>
          <span className="text-xs text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">Opcional</span>
        </div>
        <div className="flex items-start gap-2 text-xs text-zinc-500 bg-zinc-900/50 rounded-lg p-3 border border-zinc-800 mb-2">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>
            Describe cómo quieres que se edite tu vídeo. La IA usará esta guía al analizar y generar la edición.
          </span>
        </div>
        <textarea
          value={styleRef}
          onChange={e => onStyleRefChange(e.target.value)}
          rows={4}
          placeholder='Ej: "Quiero cortes limpios, zooms sutiles en frases clave, subtítulos solo en momentos importantes, música motivacional suave y estructura: gancho — desarrollo — cierre."'
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none leading-relaxed"
        />
      </div>

      {/* Project info */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-zinc-300">Información del proyecto</h3>
        <div className="space-y-2 text-sm">
          <InfoRow label="Nombre" value={project.name} />
          {project.videoName && <InfoRow label="Fichero" value={project.videoName} />}
          {project.videoSize && <InfoRow label="Tamaño" value={formatFileSize(project.videoSize)} />}
          {project.duration && <InfoRow label="Duración" value={formatDurationVerbose(project.duration)} />}
          <InfoRow label="Estado" value={PROJECT_STATUS_LABELS[project.status] || project.status} />
          <InfoRow label="Creado" value={formatRelativeDate(project.createdAt)} />
          <InfoRow label="Actualizado" value={formatRelativeDate(project.updatedAt)} />
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-zinc-500 shrink-0">{label}</span>
      <span className="text-zinc-300 text-right truncate">{value}</span>
    </div>
  )
}

// ─── Export tab ──────────────────────────────────────────────────────────────

function ExportTab({
  exports,
  onExportLong,
  exporting,
  progress,
  hasAnalysis,
}: {
  exports: Project['exports']
  onExportLong: () => void
  exporting: boolean
  progress: number
  hasAnalysis: boolean
}) {
  return (
    <div className="space-y-6">
      {/* Export long video */}
      <Card>
        <h3 className="text-sm font-semibold text-zinc-200 mb-1">Exportar vídeo largo editado</h3>
        <p className="text-xs text-zinc-500 mb-4">
          Genera la versión editada con todos los cortes sugeridos, zooms y música aplicados.
        </p>
        {exporting && (
          <Progress value={progress} size="md" color="violet" label="Procesando vídeo..." showLabel className="mb-4" animated />
        )}
        <Button
          variant="primary"
          className="w-full"
          icon={<Download className="h-4 w-4" />}
          onClick={onExportLong}
          loading={exporting}
          disabled={!hasAnalysis}
        >
          Exportar vídeo largo (1080p)
        </Button>
        {!hasAnalysis && (
          <p className="text-xs text-zinc-600 text-center mt-2">
            Necesitas analizar el vídeo primero
          </p>
        )}
      </Card>

      {/* Export history */}
      {exports.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-zinc-300 mb-3">
            Historial de exportaciones ({exports.length})
          </h3>
          <div className="space-y-3">
            {exports.map(exp => (
              <ExportRow key={exp.id} export_={exp} />
            ))}
          </div>
        </div>
      )}

      {exports.length === 0 && (
        <EmptyTab
          icon={<Download className="h-8 w-8 text-zinc-600" />}
          title="Sin exportaciones"
          desc="Exporta el vídeo largo o clips cortos para descargarlos."
        />
      )}
    </div>
  )
}

function ExportRow({ export_: exp }: { export_: Project['exports'][number] }) {
  const statusColors = {
    pending:    'default' as const,
    processing: 'violet' as const,
    ready:      'success' as const,
    failed:     'error' as const,
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 shrink-0">
        <Download className="h-4 w-4 text-zinc-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-200 truncate">
          {exp.type === 'long' ? 'Vídeo largo' : 'Clip corto'} · {exp.resolution}
        </p>
        <p className="text-xs text-zinc-500 mt-0.5">
          {exp.fileSize ? formatFileSize(exp.fileSize) : '—'}
          {' · '}
          {formatRelativeDate(exp.createdAt)}
        </p>
      </div>
      <Badge variant={statusColors[exp.status as keyof typeof statusColors] || 'default'}>
        {exp.status === 'ready' ? 'Listo' :
         exp.status === 'processing' ? 'Procesando' :
         exp.status === 'failed' ? 'Error' : 'Pendiente'}
      </Badge>
      {exp.status === 'ready' && exp.outputPath && (
        <a
          href={exp.outputPath}
          download
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors shrink-0"
        >
          <Download className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyTab({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-zinc-300 mb-2">{title}</h3>
      <p className="text-sm text-zinc-500 max-w-sm leading-relaxed">{desc}</p>
    </div>
  )
}
