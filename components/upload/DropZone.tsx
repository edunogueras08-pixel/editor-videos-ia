'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Film, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const ALLOWED_EXTENSIONS = ['.mp4', '.mov', '.avi', '.webm', '.mpeg', '.mpg']
const MAX_VIDEO_SIZE = 10 * 1024 * 1024 * 1024 // 10 GB

interface UploadDropZoneProps {
  onFileAccepted: (file: File) => void
}

export function UploadDropZone({ onFileAccepted }: UploadDropZoneProps) {
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    (accepted: File[], rejected: any[]) => {
      setError(null)

      if (rejected.length > 0) {
        const err = rejected[0].errors[0]
        if (err.code === 'file-too-large') {
          setError(`El fichero supera el tamaño máximo de 10 GB.`)
        } else if (err.code === 'file-invalid-type') {
          setError('Formato no soportado. Usa MP4, MOV, AVI o WebM.')
        } else {
          setError('Fichero no válido.')
        }
        return
      }

      if (accepted.length > 0) {
        onFileAccepted(accepted[0])
      }
    },
    [onFileAccepted]
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': ['.mp4'],
      'video/quicktime': ['.mov'],
      'video/x-msvideo': ['.avi'],
      'video/webm': ['.webm'],
      'video/mpeg': ['.mpeg', '.mpg'],
    },
    maxFiles: 1,
    maxSize: MAX_VIDEO_SIZE,
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-16 text-center transition-all duration-200 cursor-pointer',
          isDragActive && !isDragReject
            ? 'border-violet-500 bg-violet-500/5 scale-[1.01]'
            : isDragReject
            ? 'border-red-500 bg-red-500/5'
            : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-900/80'
        )}
      >
        <input {...getInputProps()} />

        {/* Icon */}
        <div
          className={cn(
            'mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border transition-colors',
            isDragActive && !isDragReject
              ? 'border-violet-500/50 bg-violet-500/10'
              : 'border-zinc-700 bg-zinc-800'
          )}
        >
          {isDragReject ? (
            <AlertCircle className="h-7 w-7 text-red-400" />
          ) : isDragActive ? (
            <Film className="h-7 w-7 text-violet-400" />
          ) : (
            <Upload className="h-7 w-7 text-zinc-400" />
          )}
        </div>

        {/* Text */}
        {isDragActive && !isDragReject ? (
          <>
            <p className="text-base font-semibold text-violet-400">Suelta el vídeo aquí</p>
            <p className="text-sm text-zinc-500 mt-1">Listo para subir</p>
          </>
        ) : isDragReject ? (
          <>
            <p className="text-base font-semibold text-red-400">Formato no soportado</p>
            <p className="text-sm text-zinc-500 mt-1">Usa MP4, MOV, AVI o WebM</p>
          </>
        ) : (
          <>
            <p className="text-base font-semibold text-zinc-200">
              Arrastra tu vídeo aquí
            </p>
            <p className="text-sm text-zinc-500 mt-1">
              o{' '}
              <span className="text-violet-400 font-medium hover:underline">
                haz clic para seleccionar
              </span>
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {ALLOWED_EXTENSIONS.map(ext => (
                <span
                  key={ext}
                  className="rounded-md bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-xs text-zinc-400 font-mono"
                >
                  {ext}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-zinc-600">
              Máximo 10 GB · HD o 4K recomendado
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}
