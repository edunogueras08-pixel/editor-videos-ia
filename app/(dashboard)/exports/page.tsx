import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import { Download, Film, Scissors, ExternalLink, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { formatFileSize, formatRelativeDate, formatDurationVerbose, EXPORT_STATUS_LABELS } from '@/lib/utils/formatters'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Exportaciones' }
export const dynamic = 'force-dynamic'

export default async function ExportsPage() {
  const exports = await prisma.export.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      project: { select: { id: true, name: true } },
      clip:    { select: { title: true } },
    },
    take: 50,
  })

  const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'error' | 'violet'> = {
    pending:    'default',
    processing: 'violet',
    ready:      'success',
    failed:     'error',
  }

  return (
    <div className="px-8 py-8 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-50">Exportaciones</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {exports.length} exportacion{exports.length !== 1 ? 'es' : ''} en total
        </p>
      </div>

      {exports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900">
            <Download className="h-7 w-7 text-zinc-600" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-300 mb-2">Sin exportaciones</h2>
          <p className="text-sm text-zinc-500 max-w-sm">
            Ve a un proyecto y exporta el vídeo largo o genera clips para verlos aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {exports.map(exp => (
            <div
              key={exp.id}
              className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 transition-colors"
            >
              {/* Icon */}
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-800 shrink-0">
                {exp.type === 'clip'
                  ? <Scissors className="h-4 w-4 text-violet-400" />
                  : <Film className="h-4 w-4 text-blue-400" />
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-zinc-100">
                    {exp.clip?.title || (exp.type === 'clip' ? 'Clip corto' : 'Vídeo largo')}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {exp.resolution} · {exp.format.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <Link
                    href={`/projects/${exp.project.id}`}
                    className="hover:text-violet-400 flex items-center gap-1 transition-colors"
                  >
                    {exp.project.name}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                  {exp.fileSize && <span>{formatFileSize(exp.fileSize)}</span>}
                  {exp.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDurationVerbose(exp.duration)}
                    </span>
                  )}
                  <span>{formatRelativeDate(exp.createdAt.toISOString())}</span>
                </div>
              </div>

              {/* Status */}
              <Badge variant={statusVariant[exp.status] || 'default'} dot={exp.status === 'processing'}>
                {EXPORT_STATUS_LABELS[exp.status] || exp.status}
              </Badge>

              {/* Download button */}
              {exp.status === 'ready' && exp.outputPath ? (
                <a
                  href={exp.outputPath}
                  download
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors shrink-0"
                  title="Descargar"
                >
                  <Download className="h-4 w-4" />
                </a>
              ) : (
                <div className="w-9" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
