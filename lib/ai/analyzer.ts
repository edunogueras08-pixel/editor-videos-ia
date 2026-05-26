/**
 * AI Analyzer Service
 * ──────────────────────────────────────────────────────────────────────────────
 * En esta primera versión, genera datos simulados realistas.
 * Para conectar IA real, reemplaza las funciones marcadas con [REAL AI].
 *
 * Integraciones futuras:
 *   - Transcripción: OpenAI Whisper / AssemblyAI
 *   - Highlights:    Claude API / GPT-4
 *   - Silencios:     FFmpeg silencedetect filter
 *   - Estructura:    Claude API con el transcript
 * ──────────────────────────────────────────────────────────────────────────────
 */

export interface Highlight {
  time: number       // segundos desde el inicio
  duration: number   // duración del momento en segundos
  label: string      // etiqueta descriptiva
  score: number      // 0-1, puntuación de importancia
  type: 'hook' | 'key-point' | 'emotional' | 'funny' | 'insight' | 'cta'
}

export interface SuggestedCut {
  startTime: number
  endTime: number
  reason: string
  type: 'silence' | 'filler' | 'pause' | 'repetition' | 'boring' | 'error'
  priority: 'high' | 'medium' | 'low'
}

export interface VideoStructure {
  hook: { start: number; end: number; description: string }
  intro: { start: number; end: number; description: string }
  development: Array<{ start: number; end: number; topic: string }>
  keyMoments: Array<{ time: number; text: string; importance: 'high' | 'medium' }
  >
  outro: { start: number; end: number; description: string }
}

export interface KeyMoment {
  time: number
  text: string
  importance: 'high' | 'medium' | 'low'
  keyword: string
}

export interface Silence {
  startTime: number
  endTime: number
  duration: number
}

export interface ZoomPoint {
  time: number
  scale: number   // 1.0 - 1.5
  reason: string
}

export interface AnalysisResult {
  highlights: Highlight[]
  suggestedCuts: SuggestedCut[]
  structure: VideoStructure
  keyMoments: KeyMoment[]
  silences: Silence[]
  zoomPoints: ZoomPoint[]
  totalScore: number
  wordCount: number | null
  transcript: string | null
}

/**
 * [REAL AI] Transcribe el vídeo usando Whisper o similar.
 * Actualmente genera un transcript simulado.
 */
async function transcribeVideo(_videoPath: string, duration: number): Promise<string> {
  // TODO: integrar OpenAI Whisper
  // const openai = new OpenAI()
  // const transcription = await openai.audio.transcriptions.create({ file, model: 'whisper-1' })

  const samplePhrases = [
    'Hoy vamos a hablar sobre un tema que me parece fundamental.',
    'Lo que nadie te dice sobre este proceso es que lleva tiempo.',
    'Pero primero, déjame contarte mi experiencia personal.',
    'Esto cambió completamente mi forma de ver las cosas.',
    'Y aquí viene la parte más importante de todo esto.',
    'Muchas personas cometen este error y es totalmente evitable.',
    'Si implementas esta estrategia, verás resultados en semanas.',
    'El secreto está en la consistencia, no en la velocidad.',
    'Te voy a dar tres claves que nadie más está contando.',
    'Antes de terminar, quiero que recuerdes esto.',
  ]

  const phrasesPerMinute = 6
  const totalPhrases = Math.max(5, Math.floor((duration / 60) * phrasesPerMinute))
  const phrases: string[] = []

  for (let i = 0; i < totalPhrases; i++) {
    phrases.push(samplePhrases[i % samplePhrases.length])
  }

  return phrases.join(' ')
}

/**
 * [REAL AI] Analiza el vídeo completo.
 * Actualmente genera análisis simulado realista basado en la duración.
 */
export async function analyzeVideo(
  videoPath: string,
  duration: number,
  style: string = 'professional'
): Promise<AnalysisResult> {
  // Simular tiempo de procesamiento (500ms - 2s)
  await new Promise(r => setTimeout(r, Math.random() * 1500 + 500))

  const transcript = await transcribeVideo(videoPath, duration)

  // Generar highlights simulados realistas
  const highlights = generateHighlights(duration)

  // Generar cortes sugeridos (silencios, relleno, pausas)
  const suggestedCuts = generateSuggestedCuts(duration)

  // Generar silences
  const silences = generateSilences(duration)

  // Generar estructura del vídeo
  const structure = generateStructure(duration, style)

  // Generar momentos clave
  const keyMoments = generateKeyMoments(duration)

  // Puntos de zoom
  const zoomPoints = generateZoomPoints(highlights)

  // Score total (basado en el potencial del contenido)
  const totalScore = 0.65 + Math.random() * 0.25

  return {
    highlights,
    suggestedCuts,
    structure,
    keyMoments,
    silences,
    zoomPoints,
    totalScore,
    wordCount: Math.floor(duration * 2.5),
    transcript,
  }
}

function generateHighlights(duration: number): Highlight[] {
  const types: Highlight['type'][] = ['hook', 'key-point', 'emotional', 'funny', 'insight', 'cta']
  const labels = {
    hook: ['Gancho inicial potente', 'Apertura impactante', 'Promesa inicial'],
    'key-point': ['Punto clave principal', 'Revelación importante', 'Dato sorprendente'],
    emotional: ['Momento emocional', 'Historia personal', 'Conexión con el público'],
    funny: ['Momento gracioso', 'Anécdota divertida', 'Humor natural'],
    insight: ['Insight valioso', 'Perspectiva única', 'Reflexión profunda'],
    cta: ['Llamada a la acción', 'Invitación al público', 'Pregunta al espectador'],
  }

  const count = Math.max(3, Math.floor(duration / 180) + 2) // ~1 highlight cada 3 min
  const highlights: Highlight[] = []

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const labelOptions = labels[type]
    const time = i === 0 ? Math.random() * 15 : (duration / count) * i + Math.random() * 30 - 15
    highlights.push({
      time: Math.max(0, Math.min(time, duration - 30)),
      duration: 15 + Math.random() * 45,
      label: labelOptions[Math.floor(Math.random() * labelOptions.length)],
      score: 0.5 + Math.random() * 0.5,
      type,
    })
  }

  return highlights.sort((a, b) => a.time - b.time)
}

function generateSuggestedCuts(duration: number): SuggestedCut[] {
  const reasons = {
    silence: ['Silencio prolongado detectado', 'Pausa demasiado larga', 'Sin audio por más de 3s'],
    filler: ['Palabras de relleno: "ehhh", "mmm"', 'Repetición innecesaria', 'Filler words excesivos'],
    pause: ['Pausa antes de seguir', 'Momento de duda', 'Corte limpio posible'],
    repetition: ['Frase repetida del segmento anterior', 'Idea ya mencionada', 'Contenido duplicado'],
    boring: ['Segmento con bajo ritmo narrativo', 'Parte plana sin enganche', 'Ritmo demasiado lento'],
    error: ['Posible error de grabación', 'Ruido de fondo alto', 'Problema técnico detectado'],
  }

  const types: SuggestedCut['type'][] = ['silence', 'filler', 'pause', 'repetition', 'boring']
  const count = Math.max(3, Math.floor(duration / 120))
  const cuts: SuggestedCut[] = []

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const startTime = (duration / count) * i + Math.random() * 60
    const cutDuration = 2 + Math.random() * 8
    cuts.push({
      startTime: Math.max(0, startTime),
      endTime: Math.min(startTime + cutDuration, duration),
      reason: reasons[type][Math.floor(Math.random() * reasons[type].length)],
      type,
      priority: Math.random() > 0.6 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
    })
  }

  return cuts.sort((a, b) => a.startTime - b.startTime)
}

function generateSilences(duration: number): Silence[] {
  const count = Math.floor(duration / 60) + 2
  const silences: Silence[] = []

  for (let i = 0; i < count; i++) {
    const startTime = (duration / count) * i + Math.random() * 30
    const silenceDuration = 2 + Math.random() * 4
    silences.push({
      startTime: Math.max(0, startTime),
      endTime: Math.min(startTime + silenceDuration, duration),
      duration: silenceDuration,
    })
  }

  return silences
}

function generateStructure(duration: number, _style: string): VideoStructure {
  const hookEnd = Math.min(30, duration * 0.05)
  const introEnd = Math.min(120, duration * 0.15)
  const outroStart = duration * 0.88
  const midpoint = duration / 2

  return {
    hook: {
      start: 0,
      end: hookEnd,
      description: 'Gancho inicial: pregunta impactante o promesa de valor',
    },
    intro: {
      start: hookEnd,
      end: introEnd,
      description: 'Presentación del tema y contexto del vídeo',
    },
    development: [
      {
        start: introEnd,
        end: midpoint * 0.6,
        topic: 'Bloque 1: Fundamentos y contexto',
      },
      {
        start: midpoint * 0.6,
        end: midpoint * 1.1,
        topic: 'Bloque 2: Desarrollo principal',
      },
      {
        start: midpoint * 1.1,
        end: outroStart,
        topic: 'Bloque 3: Aplicación práctica y casos',
      },
    ],
    keyMoments: [
      { time: hookEnd + 10, text: 'Primera revelación clave', importance: 'high' },
      { time: midpoint * 0.7, text: 'Punto de inflexión narrativo', importance: 'high' },
      { time: midpoint * 1.2, text: 'Ejemplo práctico destacado', importance: 'medium' },
    ],
    outro: {
      start: outroStart,
      end: duration,
      description: 'Resumen, llamada a la acción y cierre',
    },
  }
}

function generateKeyMoments(duration: number): KeyMoment[] {
  const moments = [
    { keyword: 'estrategia', text: 'La estrategia clave que cambia todo' },
    { keyword: 'error', text: 'El error que debes evitar a toda costa' },
    { keyword: 'resultado', text: 'Resultados reales con esta técnica' },
    { keyword: 'secreto', text: 'El secreto que nadie te cuenta' },
    { keyword: 'cambio', text: 'Por qué esto lo cambia todo' },
    { keyword: 'clave', text: 'La clave para conseguirlo' },
  ]

  const count = Math.max(3, Math.floor(duration / 200))
  const selected = moments.slice(0, count)

  return selected.map((m, i) => ({
    time: (duration / count) * (i + 0.5),
    text: m.text,
    importance: i < 2 ? 'high' : 'medium' as 'high' | 'medium' | 'low',
    keyword: m.keyword,
  }))
}

function generateZoomPoints(highlights: Highlight[]): ZoomPoint[] {
  return highlights
    .filter(h => h.score > 0.7)
    .slice(0, 5)
    .map(h => ({
      time: h.time,
      scale: 1.05 + Math.random() * 0.15,
      reason: `Zoom suave en: ${h.label}`,
    }))
}
