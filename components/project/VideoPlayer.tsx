'use client'

import { useRef, useState, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw } from 'lucide-react'
import { formatDuration } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'

interface VideoPlayerProps {
  src: string
  poster?: string
  className?: string
  onTimeUpdate?: (time: number) => void
  markers?: Array<{ time: number; color?: string; label?: string }>
}

export function VideoPlayer({ src, poster, className, onTimeUpdate, markers = [] }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  function togglePlay() {
    const v = videoRef.current
    if (!v) return
    if (playing) {
      v.pause()
    } else {
      v.play()
    }
  }

  function handleTimeUpdate() {
    const v = videoRef.current
    if (!v) return
    setCurrentTime(v.currentTime)
    onTimeUpdate?.(v.currentTime)
    // Update buffered
    if (v.buffered.length > 0) {
      setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100)
    }
  }

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = progressRef.current?.getBoundingClientRect()
    if (!rect || !videoRef.current || !duration) return
    const x = e.clientX - rect.left
    const pct = x / rect.width
    videoRef.current.currentTime = pct * duration
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value)
    setVolume(v)
    if (videoRef.current) videoRef.current.volume = v
    setMuted(v === 0)
  }

  function toggleMute() {
    const v = videoRef.current
    if (!v) return
    v.muted = !muted
    setMuted(!muted)
  }

  function toggleFullscreen() {
    const container = videoRef.current?.parentElement?.parentElement
    if (!container) return
    if (!document.fullscreenElement) {
      container.requestFullscreen()
      setFullscreen(true)
    } else {
      document.exitFullscreen()
      setFullscreen(false)
    }
  }

  function restart() {
    if (!videoRef.current) return
    videoRef.current.currentTime = 0
    videoRef.current.play()
  }

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const v = videoRef.current
      if (!v) return
      if (e.code === 'Space') { e.preventDefault(); togglePlay() }
      if (e.code === 'ArrowLeft') { v.currentTime = Math.max(0, v.currentTime - 5) }
      if (e.code === 'ArrowRight') { v.currentTime = Math.min(duration, v.currentTime + 5) }
      if (e.code === 'KeyM') toggleMute()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [playing, muted, duration])

  return (
    <div
      className={cn(
        'group relative rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800',
        className
      )}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full aspect-video object-contain"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (videoRef.current) setDuration(videoRef.current.duration)
        }}
        onClick={togglePlay}
      />

      {/* Controls overlay */}
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent',
          'px-4 pb-3 pt-8 transition-opacity duration-300',
          'opacity-0 group-hover:opacity-100',
          playing ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
        )}
      >
        {/* Progress bar + markers */}
        <div className="relative mb-3">
          <div
            ref={progressRef}
            className="h-1.5 bg-zinc-700 rounded-full cursor-pointer relative overflow-hidden"
            onClick={handleProgressClick}
          >
            {/* Buffered */}
            <div
              className="absolute inset-y-0 left-0 bg-zinc-600 rounded-full"
              style={{ width: `${buffered}%` }}
            />
            {/* Progress */}
            <div
              className="absolute inset-y-0 left-0 bg-violet-500 rounded-full transition-none"
              style={{ width: `${progress}%` }}
            />
            {/* Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white shadow-md"
              style={{ left: `${progress}%` }}
            />
          </div>

          {/* Markers (highlights) */}
          {markers.map((m, i) => {
            if (!duration) return null
            const left = (m.time / duration) * 100
            return (
              <div
                key={i}
                className="absolute top-0 w-1.5 h-1.5 rounded-full -translate-x-1/2 -translate-y-0.5 cursor-pointer"
                style={{ left: `${left}%`, backgroundColor: m.color || '#a78bfa' }}
                title={m.label}
              />
            )
          })}
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-200 hover:text-white hover:bg-zinc-700/50 transition-colors"
          >
            {playing ? <Pause className="h-4 w-4" fill="currentColor" /> : <Play className="h-4 w-4" fill="currentColor" />}
          </button>

          {/* Restart */}
          <button
            onClick={restart}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          {/* Time */}
          <span className="text-xs text-zinc-400 font-mono tabular-nums">
            {formatDuration(currentTime)} / {formatDuration(duration)}
          </span>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Volume */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50 transition-colors"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 accent-violet-500 cursor-pointer"
            />
          </div>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50 transition-colors"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Big play button when paused */}
      {!playing && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 hover:bg-violet-600 hover:border-violet-500 transition-all duration-200 shadow-xl">
            <Play className="h-6 w-6 text-white ml-0.5" fill="currentColor" />
          </div>
        </button>
      )}
    </div>
  )
}
