/**
 * Formatters — utilidades de formato reutilizables
 */

/** Convierte segundos en formato HH:MM:SS o MM:SS */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}

/** Convierte segundos en formato legible: "1h 23m 45s" */
export function formatDurationVerbose(seconds: number): string {
  if (!seconds || seconds < 0) return '0s'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const parts: string[] = []
  if (h > 0) parts.push(`${h}h`)
  if (m > 0) parts.push(`${m}m`)
  if (s > 0) parts.push(`${s}s`)
  return parts.join(' ') || '0s'
}

/** Formatea bytes en formato legible: KB, MB, GB */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes < 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  let size = bytes
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024
    i++
  }
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

/** Devuelve fecha relativa: "hace 2 horas", "ayer", etc. */
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'hace un momento'
  if (diffMin < 60) return `hace ${diffMin} min`
  if (diffHour < 24) return `hace ${diffHour}h`
  if (diffDay === 1) return 'ayer'
  if (diffDay < 7) return `hace ${diffDay} días`
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** Formatea una fecha completa */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Convierte un score 0-1 en porcentaje con texto */
export function formatScore(score: number): string {
  return `${Math.round(score * 100)}%`
}

/** Mapea status del proyecto a texto legible */
export const PROJECT_STATUS_LABELS: Record<string, string> = {
  uploaded: 'Subido',
  analyzing: 'Analizando',
  analyzed: 'Analizado',
  editing: 'Editando',
  exporting: 'Exportando',
  done: 'Completado',
  error: 'Error',
}

/** Mapea status de export a texto legible */
export const EXPORT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  processing: 'Procesando',
  ready: 'Listo',
  failed: 'Error',
}

/** Mapea tono musical a texto y emoji */
export const MUSIC_TONE_LABELS: Record<string, { label: string; emoji: string }> = {
  motivational: { label: 'Motivacional', emoji: '🔥' },
  emotional: { label: 'Emocional', emoji: '💜' },
  energetic: { label: 'Enérgico', emoji: '⚡' },
  mysterious: { label: 'Misterioso', emoji: '🌙' },
  calm: { label: 'Tranquilo', emoji: '🌊' },
  premium: { label: 'Premium', emoji: '✨' },
}

/** Mapea estilo de edición a info */
export const STYLE_INFO: Record<string, { label: string; desc: string; icon: string }> = {
  professional: {
    label: 'Limpio Profesional',
    desc: 'Cortes limpios, ritmo pausado, subtítulos discretos. Ideal para tutoriales y entrevistas.',
    icon: '🎬',
  },
  dynamic: {
    label: 'Dinámico Creator',
    desc: 'Ritmo rápido, zooms frecuentes, efectos modernos. Ideal para vlogs y contenido viral.',
    icon: '⚡',
  },
  storytelling: {
    label: 'Storytelling Intenso',
    desc: 'Estructura narrativa fuerte, música emocional, transiciones dramáticas.',
    icon: '📖',
  },
  educational: {
    label: 'Educativo Premium',
    desc: 'Títulos en pantalla, visuales didácticos, ritmo claro y estructurado.',
    icon: '🎓',
  },
  minimalist: {
    label: 'Minimalista',
    desc: 'Lo esencial. Sin efectos, subtítulos mínimos, espaciado limpio.',
    icon: '◻️',
  },
}

/** Mapea plataforma de clip a info */
export const PLATFORM_INFO: Record<string, { label: string; color: string }> = {
  tiktok: { label: 'TikTok', color: 'text-pink-400' },
  shorts: { label: 'YouTube Shorts', color: 'text-red-400' },
  reels: { label: 'Instagram Reels', color: 'text-purple-400' },
  all: { label: 'Todas las plataformas', color: 'text-violet-400' },
}
