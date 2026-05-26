/**
 * Clip Generator Service
 * ──────────────────────────────────────────────────────────────────────────────
 * Detecta los mejores momentos para clips cortos virales.
 * Versión actual: simulada con datos realistas.
 *
 * Integración futura:
 *   - Usar el transcript + análisis para detectar ganchos virales
 *   - Claude API para evaluar el potencial viral de cada segmento
 *   - FFmpeg para generar los clips reales con subtítulos y reencuadre
 * ──────────────────────────────────────────────────────────────────────────────
 */

import type { Highlight } from './analyzer'

export interface ClipSuggestion {
  title: string
  description: string
  startTime: number
  endTime: number
  duration: number
  reason: string
  score: number    // 0-1, potencial viral
  platform: 'tiktok' | 'shorts' | 'reels' | 'all'
  format: 'vertical' | 'horizontal'
  hasSubtitles: boolean
  hasZoom: boolean
}

const VIRAL_HOOKS = [
  'Esto que nadie te dice sobre',
  'El momento en que todo cambió',
  'La verdad que cambia todo',
  'Lo que descubrí después de años',
  'El error que casi me cuesta todo',
  'Cuando entendí esto, todo mejoró',
  '¿Por qué nadie habla de esto?',
  'El secreto detrás del éxito',
  'Lo que los expertos no comparten',
  'Esta es la razón por la que fallan',
]

const PLATFORMS: Array<'tiktok' | 'shorts' | 'reels' | 'all'> = [
  'all', 'tiktok', 'shorts', 'reels', 'all'
]

/**
 * [REAL AI] Genera sugerencias de clips virales.
 * Actualmente simula la detección de momentos virales.
 */
export async function generateClipSuggestions(
  highlights: Highlight[],
  videoDuration: number,
  style: string = 'professional'
): Promise<ClipSuggestion[]> {
  // Simular tiempo de procesamiento
  await new Promise(r => setTimeout(r, Math.random() * 1000 + 500))

  const clips: ClipSuggestion[] = []

  // Generar clips desde los highlights más potentes
  const sortedHighlights = [...highlights].sort((a, b) => b.score - a.score)

  for (let i = 0; i < Math.min(sortedHighlights.length, 6); i++) {
    const highlight = sortedHighlights[i]
    const hookIndex = Math.floor(Math.random() * VIRAL_HOOKS.length)
    const platform = PLATFORMS[i % PLATFORMS.length]

    // Clip entre 15 y 60 segundos
    const targetDuration = 15 + Math.floor(Math.random() * 45)
    const endTime = Math.min(
      highlight.time + highlight.duration + Math.random() * 20,
      highlight.time + targetDuration,
      videoDuration
    )
    const startTime = Math.max(0, highlight.time - 5)
    const actualDuration = endTime - startTime

    clips.push({
      title: `${VIRAL_HOOKS[hookIndex]} — Clip ${i + 1}`,
      description: `Segmento de alto impacto basado en: ${highlight.label}`,
      startTime,
      endTime,
      duration: actualDuration,
      reason: getClipReason(highlight.type, style),
      score: highlight.score * (0.85 + Math.random() * 0.15),
      platform,
      format: 'vertical',
      hasSubtitles: true,
      hasZoom: highlight.score > 0.7,
    })
  }

  // Añadir algunos clips adicionales en zonas no cubiertas
  const extraClips = generateExtraClips(highlights, videoDuration, clips.length)
  clips.push(...extraClips)

  return clips.sort((a, b) => b.score - a.score).slice(0, 8)
}

function getClipReason(type: Highlight['type'], style: string): string {
  const reasons: Record<string, Record<string, string>> = {
    hook: {
      professional: 'Inicio impactante que genera curiosidad inmediata',
      dynamic: 'Gancho viral perfecto para los primeros 3 segundos',
      storytelling: 'Apertura narrativa que engancha emocionalmente',
      educational: 'Pregunta que activa la curiosidad del espectador',
      minimalist: 'Apertura limpia y directa al valor',
    },
    'key-point': {
      default: 'Momento de alto valor informativo con potencial de compartir',
    },
    emotional: {
      default: 'Momento emocional que conecta y genera engagement',
    },
    funny: {
      default: 'Humor natural que aumenta la retención y compartidos',
    },
    insight: {
      default: 'Insight único que aporta valor real y genera saves',
    },
    cta: {
      default: 'Llamada a la acción que impulsa interacción',
    },
  }

  const typeReasons = reasons[type]
  if (!typeReasons) return 'Alto potencial viral detectado por IA'
  return typeReasons[style] || typeReasons['default'] || 'Alto potencial viral detectado'
}

function generateExtraClips(
  highlights: Highlight[],
  duration: number,
  existingCount: number
): ClipSuggestion[] {
  if (existingCount >= 8) return []

  const extras: ClipSuggestion[] = []
  const covered = highlights.map(h => h.time)

  // Generar 1-2 clips extra en zonas no cubiertas
  const count = Math.min(2, 8 - existingCount)

  for (let i = 0; i < count; i++) {
    const randomTime = Math.random() * (duration * 0.7) + duration * 0.15
    const isNearExisting = covered.some(t => Math.abs(t - randomTime) < 60)
    if (isNearExisting) continue

    const clipDuration = 20 + Math.floor(Math.random() * 35)
    extras.push({
      title: `Momento destacado extra ${i + 1}`,
      description: 'Segmento seleccionado por ritmo y contenido',
      startTime: Math.max(0, randomTime - 5),
      endTime: Math.min(randomTime + clipDuration, duration),
      duration: clipDuration,
      reason: 'Ritmo narrativo óptimo para clip corto',
      score: 0.4 + Math.random() * 0.3,
      platform: 'all',
      format: 'vertical',
      hasSubtitles: true,
      hasZoom: false,
    })
  }

  return extras
}
