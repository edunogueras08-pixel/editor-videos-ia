import { Settings, Cpu, HardDrive, Zap, Info } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Ajustes' }

export default function SettingsPage() {
  return (
    <div className="px-8 py-8 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-50">Ajustes</h1>
        <p className="text-sm text-zinc-500 mt-1">Configuración de AI Video Studio</p>
      </div>

      <div className="space-y-6">
        {/* AI settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-violet-400" />
              <CardTitle>Inteligencia Artificial</CardTitle>
            </div>
            <Badge variant="warning">Simulado</Badge>
          </CardHeader>
          <div className="space-y-4 text-sm">
            <SettingRow
              label="Motor de análisis"
              value="Simulado (v1.0)"
              desc="En producción: Claude API / GPT-4"
            />
            <SettingRow
              label="Transcripción"
              value="Simulada"
              desc="Integración futura: OpenAI Whisper"
            />
            <SettingRow
              label="Detección de highlights"
              value="Algoritmo propio"
              desc="Basado en patrones de duración y tipo"
            />
            <SettingRow
              label="Generación de clips"
              value="Simulada"
              desc="Integración futura: análisis semántico"
            />
          </div>
        </Card>

        {/* FFmpeg */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-blue-400" />
              <CardTitle>Procesamiento de vídeo</CardTitle>
            </div>
            <Badge variant="warning">No conectado</Badge>
          </CardHeader>
          <div className="space-y-4 text-sm">
            <SettingRow
              label="Motor de vídeo"
              value="FFmpeg (preparado)"
              desc="Instala fluent-ffmpeg para activar el procesamiento real"
            />
            <SettingRow
              label="Exportación"
              value="Simulada"
              desc="Los metadatos se guardan; el fichero real requiere FFmpeg"
            />
            <SettingRow
              label="Corte de silencios"
              value="Preparado"
              desc="FFmpeg silencedetect filter listo para conectar"
            />
            <SettingRow
              label="Subtítulos quemados"
              value="Preparado"
              desc="FFmpeg subtitles filter listo para conectar"
            />
          </div>
          <div className="mt-4 rounded-lg bg-blue-500/10 border border-blue-500/20 px-4 py-3 text-xs text-blue-300">
            <strong>Para activar FFmpeg:</strong>{' '}
            npm install fluent-ffmpeg @ffmpeg-installer/ffmpeg — luego actualiza lib/ffmpeg/processor.ts
          </div>
        </Card>

        {/* Storage */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-emerald-400" />
              <CardTitle>Almacenamiento</CardTitle>
            </div>
            <Badge variant="success">Local</Badge>
          </CardHeader>
          <div className="space-y-4 text-sm">
            <SettingRow
              label="Vídeos"
              value="public/uploads/videos/"
              desc="Almacenamiento local. Migra a S3/R2 para producción."
            />
            <SettingRow
              label="Música"
              value="public/uploads/music/"
              desc="Tracks locales de la biblioteca musical"
            />
            <SettingRow
              label="Exportaciones"
              value="public/exports/"
              desc="Vídeos exportados listos para descargar"
            />
            <SettingRow
              label="Base de datos"
              value="SQLite (prisma/dev.db)"
              desc="Proyectos, clips, música y exportaciones persistentes"
            />
          </div>
          <div className="mt-4 rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-xs text-amber-300">
            <strong>Para producción:</strong>{' '}
            Migra a PostgreSQL (cambia el provider en schema.prisma) y usa Cloudflare R2 o AWS S3 para los ficheros.
          </div>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-zinc-400" />
              <CardTitle>Acerca de</CardTitle>
            </div>
          </CardHeader>
          <div className="space-y-3 text-sm">
            <SettingRow label="Versión" value="1.0.0 (MVP)" />
            <SettingRow label="Framework" value="Next.js 16 + React 19" />
            <SettingRow label="Base de datos" value="Prisma 7 + SQLite" />
            <SettingRow label="Estilos" value="Tailwind CSS 4" />
            <SettingRow label="Estado" value="Zustand" />
          </div>
        </Card>
      </div>
    </div>
  )
}

function SettingRow({
  label,
  value,
  desc,
}: {
  label: string
  value: string
  desc?: string
}) {
  return (
    <div className="flex flex-col gap-0.5 py-2 border-b border-zinc-800 last:border-0">
      <div className="flex justify-between gap-4">
        <span className="text-zinc-400 shrink-0">{label}</span>
        <span className="text-zinc-200 font-mono text-xs text-right">{value}</span>
      </div>
      {desc && <span className="text-xs text-zinc-600 leading-relaxed">{desc}</span>}
    </div>
  )
}
