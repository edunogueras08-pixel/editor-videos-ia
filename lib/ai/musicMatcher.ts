/**
 * Music Matcher Service
 * ──────────────────────────────────────────────────────────────────────────────
 * Selecciona la música más apropiada según el tono del vídeo y el estilo.
 *
 * Integración futura:
 *   - Análisis de audio con librosa o essentia
 *   - Claude API para evaluar match tono-contenido
 *   - Ducking automático de la música bajo la voz con FFmpeg
 * ──────────────────────────────────────────────────────────────────────────────
 */

export type MusicTone = 'motivational' | 'emotional' | 'energetic' | 'mysterious' | 'calm' | 'premium'

const STYLE_TO_TONE: Record<string, MusicTone[]> = {
  professional: ['calm', 'premium'],
  dynamic: ['energetic', 'motivational'],
  storytelling: ['emotional', 'mysterious'],
  educational: ['calm', 'premium'],
  minimalist: ['calm'],
}

const TONE_SCORES: Record<MusicTone, Record<string, number>> = {
  motivational: { dynamic: 0.95, storytelling: 0.7, professional: 0.5, educational: 0.6, minimalist: 0.3 },
  emotional:    { storytelling: 0.95, professional: 0.6, dynamic: 0.5, educational: 0.7, minimalist: 0.4 },
  energetic:    { dynamic: 0.95, motivational: 0.8, professional: 0.3, educational: 0.4, minimalist: 0.2 },
  mysterious:   { storytelling: 0.9, educational: 0.6, professional: 0.4, dynamic: 0.4, minimalist: 0.5 },
  calm:         { professional: 0.9, educational: 0.9, minimalist: 0.95, storytelling: 0.5, dynamic: 0.3 },
  premium:      { professional: 0.95, educational: 0.85, minimalist: 0.8, storytelling: 0.6, dynamic: 0.5 },
}

export interface MusicMatch {
  musicId: string
  score: number
  reason: string
}

export interface Music {
  id: string
  name: string
  artist?: string | null
  tone: string
  duration?: number | null
}

/**
 * [REAL AI] Selecciona la música más adecuada para el vídeo.
 * Actualmente usa un sistema de scoring basado en el estilo.
 */
export async function matchMusic(
  musicLibrary: Music[],
  style: string,
  styleRef?: string | null
): Promise<MusicMatch[]> {
  if (musicLibrary.length === 0) return []

  const preferredTones = STYLE_TO_TONE[style] || ['calm']

  const scored = musicLibrary.map(music => {
    const tonScores = TONE_SCORES[music.tone as MusicTone]
    const toneScore = tonScores?.[style] ?? 0.5
    const isPreferredTone = preferredTones.includes(music.tone as MusicTone)

    // Boost si el styleRef menciona el tono
    const refBoost = styleRef?.toLowerCase().includes(music.tone) ? 0.1 : 0

    const finalScore = Math.min(1, toneScore + (isPreferredTone ? 0.1 : 0) + refBoost)

    return {
      musicId: music.id,
      score: finalScore,
      reason: getMusicReason(music.tone as MusicTone, style, isPreferredTone),
    }
  })

  return scored.sort((a, b) => b.score - a.score)
}

function getMusicReason(tone: MusicTone, style: string, isPreferred: boolean): string {
  const base = isPreferred
    ? `Tono ${tone} — match perfecto para estilo "${style}"`
    : `Tono ${tone} — compatible con el estilo del vídeo`

  const extras: Record<MusicTone, string> = {
    motivational: '. Impulsa la energía y mantiene al espectador activo.',
    emotional: '. Potencia la conexión emocional con el contenido.',
    energetic: '. Añade ritmo y dinamismo a la edición.',
    mysterious: '. Genera intriga y mantiene la atención.',
    calm: '. No distrae y permite que el mensaje sea el protagonista.',
    premium: '. Eleva la percepción de calidad y profesionalismo.',
  }

  return base + (extras[tone] || '.')
}

/** Obtiene el volumen recomendado según si hay voz sobre la música */
export function getRecommendedVolume(hasSpeech: boolean): number {
  return hasSpeech ? 0.15 : 0.6  // 15% con voz, 60% sin voz
}
