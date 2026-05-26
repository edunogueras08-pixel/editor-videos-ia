'use client'

import { useState, useRef } from 'react'
import { Music2, Volume2, Play, Pause, Check, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { Badge } from '@/components/ui/Badge'
import { MUSIC_TONE_LABELS } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'

interface MusicTrack {
  id: string
  name: string
  artist?: string | null
  tone: string
  duration?: number | null
  filePath: string
}

interface MusicSectionProps {
  musicLibrary: MusicTrack[]
  selectedMusicId?: string | null
  onSelect: (musicId: string | null) => void
  musicVolume?: number
  onVolumeChange?: (vol: number) => void
  musicEnabled?: boolean
  onToggleMusic?: (enabled: boolean) => void
}

export function MusicSection({
  musicLibrary,
  selectedMusicId,
  onSelect,
  musicVolume = 0.15,
  onVolumeChange,
  musicEnabled = true,
  onToggleMusic,
}: MusicSectionProps) {
  const [previewId, setPreviewId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  function togglePreview(track: MusicTrack) {
    if (previewId === track.id) {
      audioRef.current?.pause()
      setPreviewId(null)
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      const audio = new Audio(track.filePath)
      audio.volume = 0.4
      audio.play().catch(() => {})
      audio.onended = () => setPreviewId(null)
      audioRef.current = audio
      setPreviewId(track.id)
    }
  }

  function handleSelect(id: string) {
    if (previewId) {
      audioRef.current?.pause()
      setPreviewId(null)
    }
    onSelect(selectedMusicId === id ? null : id)
  }

  const toneGroups = musicLibrary.reduce<Record<string, MusicTrack[]>>((acc, track) => {
    const tone = track.tone || 'calm'
    if (!acc[tone]) acc[tone] = []
    acc[tone].push(track)
    return acc
  }, {})

  return (
    <div className="space-y-5">
      {/* Music toggle + volume */}
      <div className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900">
        <Music2 className={cn('h-5 w-5 shrink-0', musicEnabled ? 'text-violet-400' : 'text-zinc-600')} />
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-200">Música de fondo</p>
          <p className="text-xs text-zinc-500 mt-0.5">No tapa la voz — ducking automático</p>
        </div>
        <button
          onClick={() => onToggleMusic?.(!musicEnabled)}
          className={cn(
            'relative w-10 h-5.5 rounded-full border transition-all duration-200',
            musicEnabled
              ? 'bg-violet-600 border-violet-500'
              : 'bg-zinc-800 border-zinc-700'
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-sm',
              musicEnabled && 'translate-x-[18px]'
            )}
          />
        </button>
      </div>

      {/* Volume slider */}
      {musicEnabled && (
        <div className="flex items-center gap-3 px-1">
          <Volume2 className="h-4 w-4 text-zinc-500 shrink-0" />
          <div className="flex-1">
            <input
              type="range"
              min={0}
              max={0.5}
              step={0.01}
              value={musicVolume}
              onChange={e => onVolumeChange?.(parseFloat(e.target.value))}
              className="w-full accent-violet-500 cursor-pointer"
            />
          </div>
          <span className="text-xs text-zinc-500 w-10 text-right">
            {Math.round(musicVolume * 100)}%
          </span>
        </div>
      )}

      {/* Library */}
      {musicEnabled && (
        <>
          {musicLibrary.length === 0 ? (
            <div className="text-center py-8 rounded-xl border border-dashed border-zinc-800">
              <Music2 className="h-8 w-8 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">No hay música en la biblioteca</p>
              <p className="text-xs text-zinc-600 mt-1">
                Ve a{' '}
                <a href="/music" className="text-violet-400 hover:underline">
                  Biblioteca Musical
                </a>{' '}
                para subir tracks
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(toneGroups).map(([tone, tracks]) => {
                const toneInfo = MUSIC_TONE_LABELS[tone]
                return (
                  <div key={tone}>
                    <p className="text-xs font-medium text-zinc-500 mb-2">
                      {toneInfo?.emoji} {toneInfo?.label || tone}
                    </p>
                    <div className="space-y-1.5">
                      {tracks.map(track => {
                        const selected = selectedMusicId === track.id
                        const previewing = previewId === track.id

                        return (
                          <div
                            key={track.id}
                            className={cn(
                              'flex items-center gap-3 rounded-lg border p-3 transition-all',
                              selected
                                ? 'border-violet-500/40 bg-violet-500/8'
                                : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                            )}
                          >
                            {/* Preview button */}
                            <button
                              onClick={() => togglePreview(track)}
                              className={cn(
                                'flex h-8 w-8 items-center justify-center rounded-lg shrink-0 transition-colors',
                                previewing
                                  ? 'bg-violet-600 text-white'
                                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                              )}
                            >
                              {previewing
                                ? <Pause className="h-3.5 w-3.5" fill="currentColor" />
                                : <Play className="h-3.5 w-3.5" fill="currentColor" />
                              }
                            </button>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-zinc-200 truncate">{track.name}</p>
                              {track.artist && (
                                <p className="text-xs text-zinc-500 truncate">{track.artist}</p>
                              )}
                            </div>

                            {/* Select button */}
                            <button
                              onClick={() => handleSelect(track.id)}
                              className={cn(
                                'flex h-7 w-7 items-center justify-center rounded-lg shrink-0 border transition-colors',
                                selected
                                  ? 'border-violet-500 bg-violet-600 text-white'
                                  : 'border-zinc-700 bg-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                              )}
                            >
                              {selected ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3 w-3" />}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
