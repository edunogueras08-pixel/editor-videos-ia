'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Music2, Upload, Trash2, Play, Pause, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { MUSIC_TONE_LABELS, formatDurationVerbose, formatFileSize, formatRelativeDate } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'

interface MusicTrack {
  id: string
  name: string
  artist?: string | null
  tone: string
  duration?: number | null
  filePath: string
  fileName: string
  fileSize?: number | null
  createdAt: string
}

const TONE_OPTIONS = Object.entries(MUSIC_TONE_LABELS).map(([key, val]) => ({
  key,
  ...val,
}))

export default function MusicPage() {
  const [tracks, setTracks] = useState<MusicTrack[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', artist: '', tone: 'calm' })
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/music')
      .then(r => r.json())
      .then(data => setTracks(data.music || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const onDrop = useCallback((files: File[]) => {
    if (files.length === 0) return
    const file = files[0]
    setPendingFile(file)
    setForm(f => ({
      ...f,
      name: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
    }))
    setShowForm(true)
    setError(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/*': ['.mp3', '.wav', '.ogg', '.aac', '.flac', '.m4a'] },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024,
  })

  async function handleUpload() {
    if (!pendingFile) return
    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', pendingFile)
      formData.append('name', form.name)
      formData.append('artist', form.artist)
      formData.append('tone', form.tone)

      const res = await fetch('/api/music', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Error al subir')
      const data = await res.json()

      setTracks(t => [data.music, ...t])
      setShowForm(false)
      setPendingFile(null)
      setForm({ name: '', artist: '', tone: 'calm' })
    } catch {
      setError('Error al subir la música. Inténtalo de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  function handlePreview(track: MusicTrack) {
    if (previewId === track.id) {
      audio?.pause()
      setPreviewId(null)
      setAudio(null)
    } else {
      audio?.pause()
      const a = new Audio(track.filePath)
      a.volume = 0.5
      a.play().catch(() => {})
      a.onended = () => { setPreviewId(null); setAudio(null) }
      setAudio(a)
      setPreviewId(track.id)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta pista?')) return
    await fetch(`/api/music/${id}`, { method: 'DELETE' })
    setTracks(t => t.filter(tr => tr.id !== id))
    if (previewId === id) { audio?.pause(); setPreviewId(null) }
  }

  const grouped = TONE_OPTIONS.reduce<Record<string, MusicTrack[]>>((acc, t) => {
    acc[t.key] = tracks.filter(tr => tr.tone === t.key)
    return acc
  }, {})

  return (
    <div className="px-8 py-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-50">Biblioteca musical</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {tracks.length} track{tracks.length !== 1 ? 's' : ''} · Sube música para añadir a tus vídeos
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => { setShowForm(true); setPendingFile(null) }}
        >
          Subir música
        </Button>
      </div>

      {/* Upload dropzone */}
      {!showForm && (
        <div
          {...getRootProps()}
          className={cn(
            'flex items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-8 mb-8 cursor-pointer transition-all',
            isDragActive
              ? 'border-violet-500 bg-violet-500/5'
              : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800">
            <Music2 className="h-5 w-5 text-zinc-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-300">
              {isDragActive ? 'Suelta aquí el archivo de audio' : 'Arrastra tu música aquí'}
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">
              MP3, WAV, OGG, AAC, FLAC · máx. 100 MB
            </p>
          </div>
          <Button variant="outline" size="sm" icon={<Upload className="h-3.5 w-3.5" />} className="ml-auto">
            Seleccionar
          </Button>
        </div>
      )}

      {/* Upload form */}
      {showForm && (
        <Card className="mb-8">
          <h3 className="text-sm font-semibold text-zinc-200 mb-4">
            {pendingFile ? `Añadir: ${pendingFile.name}` : 'Nueva pista'}
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Nombre *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
                placeholder="Nombre de la pista"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Artista</label>
              <input
                value={form.artist}
                onChange={e => setForm(f => ({ ...f, artist: e.target.value }))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
                placeholder="Artista (opcional)"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-zinc-400 mb-2">Tono musical</label>
            <div className="flex flex-wrap gap-2">
              {TONE_OPTIONS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setForm(f => ({ ...f, tone: t.key }))}
                  className={cn(
                    'px-3 py-1.5 rounded-lg border text-sm transition-all',
                    form.tone === t.key
                      ? 'border-violet-500 bg-violet-500/15 text-violet-300'
                      : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600'
                  )}
                >
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => { setShowForm(false); setPendingFile(null) }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleUpload}
              loading={uploading}
              disabled={!form.name.trim() || !pendingFile}
              icon={<Upload className="h-4 w-4" />}
            >
              Subir música
            </Button>
          </div>
        </Card>
      )}

      {/* Track list by tone */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
        </div>
      ) : tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900">
            <Music2 className="h-7 w-7 text-zinc-600" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-300 mb-2">Biblioteca vacía</h2>
          <p className="text-sm text-zinc-500">Sube tus primeras pistas musicales</p>
        </div>
      ) : (
        <div className="space-y-8">
          {TONE_OPTIONS.map(t => {
            const tTracks = grouped[t.key] || []
            if (tTracks.length === 0) return null
            return (
              <div key={t.key}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{t.emoji}</span>
                  <h2 className="text-sm font-semibold text-zinc-300">{t.label}</h2>
                  <Badge variant="default" className="ml-1">{tTracks.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tTracks.map(track => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      previewing={previewId === track.id}
                      onPreview={() => handlePreview(track)}
                      onDelete={() => handleDelete(track.id)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function TrackRow({
  track,
  previewing,
  onPreview,
  onDelete,
}: {
  track: MusicTrack
  previewing: boolean
  onPreview: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-3 hover:border-zinc-700 transition-colors">
      <button
        onClick={onPreview}
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg shrink-0 transition-colors',
          previewing ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
        )}
      >
        {previewing
          ? <Pause className="h-4 w-4" fill="currentColor" />
          : <Play className="h-4 w-4" fill="currentColor" />
        }
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-100 truncate">{track.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {track.artist && (
            <span className="text-xs text-zinc-500 truncate">{track.artist}</span>
          )}
          {track.fileSize && (
            <span className="text-xs text-zinc-600">{formatFileSize(track.fileSize)}</span>
          )}
          <span className="text-xs text-zinc-700">{formatRelativeDate(track.createdAt)}</span>
        </div>
      </div>

      <button
        onClick={onDelete}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
