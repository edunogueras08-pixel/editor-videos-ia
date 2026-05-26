/**
 * FFmpeg Processor Service
 * ──────────────────────────────────────────────────────────────────────────────
 * Capa de abstracción para todas las operaciones de vídeo con FFmpeg.
 * Estado actual: PREPARADO para integración. Las funciones devuelven
 * datos simulados hasta que se instale ffmpeg-wasm o fluent-ffmpeg.
 *
 * Para integrar FFmpeg real:
 *   npm install fluent-ffmpeg @ffmpeg-installer/ffmpeg
 *   Y descomenta el código marcado con [REAL FFMPEG]
 * ──────────────────────────────────────────────────────────────────────────────
 */

export interface ProcessingOptions {
  startTime?: number
  endTime?: number
  outputPath: string
  format?: 'mp4' | 'webm'
  resolution?: '4k' | '1080p' | '720p' | '480p'
  aspectRatio?: '16:9' | '9:16' | '1:1'
  quality?: 'high' | 'medium' | 'low'
  musicPath?: string
  musicVolume?: number
  addSubtitles?: boolean
  subtitlesPath?: string
  addZoom?: boolean
  zoomScale?: number
  zoomTime?: number
}

export interface ProcessingResult {
  success: boolean
  outputPath?: string
  duration?: number
  fileSize?: number
  error?: string
  progress?: number
}

export type ProgressCallback = (progress: number) => void

/**
 * [REAL FFMPEG] Extrae un clip del vídeo entre startTime y endTime.
 *
 * Implementación real con fluent-ffmpeg:
 * ```typescript
 * import ffmpeg from 'fluent-ffmpeg'
 * ffmpeg(inputPath)
 *   .setStartTime(startTime)
 *   .setDuration(endTime - startTime)
 *   .output(outputPath)
 *   .run()
 * ```
 */
export async function extractClip(
  _inputPath: string,
  options: ProcessingOptions,
  onProgress?: ProgressCallback
): Promise<ProcessingResult> {
  // Simular progreso de procesamiento
  return simulateProcessing(options, onProgress, 'clip')
}

/**
 * [REAL FFMPEG] Aplica cortes sugeridos al vídeo largo.
 */
export async function applyEditCuts(
  _inputPath: string,
  _cuts: Array<{ startTime: number; endTime: number }>,
  options: ProcessingOptions,
  onProgress?: ProgressCallback
): Promise<ProcessingResult> {
  return simulateProcessing(options, onProgress, 'long')
}

/**
 * [REAL FFMPEG] Añade música de fondo al vídeo.
 * Aplica ducking automático cuando hay voz.
 */
export async function addBackgroundMusic(
  _videoPath: string,
  _musicPath: string,
  _musicVolume: number,
  options: ProcessingOptions,
  onProgress?: ProgressCallback
): Promise<ProcessingResult> {
  return simulateProcessing(options, onProgress, 'music')
}

/**
 * [REAL FFMPEG] Añade subtítulos quemados al vídeo.
 */
export async function burnSubtitles(
  _videoPath: string,
  _subtitlesPath: string,
  options: ProcessingOptions,
  onProgress?: ProgressCallback
): Promise<ProcessingResult> {
  return simulateProcessing(options, onProgress, 'subtitles')
}

/**
 * [REAL FFMPEG] Aplica zoom suave en un momento específico.
 *
 * FFmpeg filter: zoompan=z='if(lte(on,1),1,min(max(zoom,pzoom)+0.002,1.5))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'
 */
export async function applyZoom(
  _inputPath: string,
  _zoomPoints: Array<{ time: number; scale: number }>,
  options: ProcessingOptions,
  onProgress?: ProgressCallback
): Promise<ProcessingResult> {
  return simulateProcessing(options, onProgress, 'zoom')
}

/**
 * [REAL FFMPEG] Cambia el aspect ratio de 16:9 a 9:16 (para clips verticales).
 * Aplica reencuadre inteligente centrado en el sujeto.
 */
export async function convertToVertical(
  _inputPath: string,
  options: ProcessingOptions,
  onProgress?: ProgressCallback
): Promise<ProcessingResult> {
  return simulateProcessing(options, onProgress, 'vertical')
}

/**
 * [REAL FFMPEG] Obtiene metadatos del vídeo (duración, resolución, etc.)
 *
 * Implementación real:
 * ```typescript
 * import ffmpeg from 'fluent-ffmpeg'
 * ffmpeg.ffprobe(videoPath, (err, metadata) => {
 *   const duration = metadata.format.duration
 *   const streams = metadata.streams
 * })
 * ```
 */
export async function getVideoMetadata(
  _videoPath: string
): Promise<{ duration: number; width: number; height: number; fps: number; codec: string }> {
  // [REAL FFMPEG] Usar ffprobe para obtener metadatos reales
  // Simulación: devuelve metadatos plausibles
  return {
    duration: 0, // Se actualizará con la duración real del fichero
    width: 1920,
    height: 1080,
    fps: 30,
    codec: 'h264',
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers internos
// ──────────────────────────────────────────────────────────────────────────────

async function simulateProcessing(
  options: ProcessingOptions,
  onProgress?: ProgressCallback,
  _type?: string
): Promise<ProcessingResult> {
  const steps = 10
  for (let i = 1; i <= steps; i++) {
    await new Promise(r => setTimeout(r, 200 + Math.random() * 300))
    onProgress?.(Math.round((i / steps) * 100))
  }

  return {
    success: true,
    outputPath: options.outputPath,
    duration: options.endTime && options.startTime
      ? options.endTime - options.startTime
      : undefined,
    fileSize: Math.floor(Math.random() * 500_000_000 + 10_000_000),
    progress: 100,
  }
}

/** Obtiene la resolución en píxeles */
export function getResolutionDimensions(resolution: string): { width: number; height: number } {
  const map: Record<string, { width: number; height: number }> = {
    '4k':    { width: 3840, height: 2160 },
    '1080p': { width: 1920, height: 1080 },
    '720p':  { width: 1280, height: 720 },
    '480p':  { width: 854, height: 480 },
  }
  return map[resolution] || map['1080p']
}
