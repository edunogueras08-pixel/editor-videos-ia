'use client'

import Link from 'next/link'
import { Video, Clock, Layers, Download, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { formatDurationVerbose, formatRelativeDate, PROJECT_STATUS_LABELS, STYLE_INFO } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'

interface ProjectCardProps {
  project: {
    id: string
    name: string
    status: string
    duration?: number | null
    thumbnail?: string | null
    style: string
    createdAt: string
    updatedAt: string
    clipsCount: number
    exportsCount: number
  }
}

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info' | 'violet'> = {
  uploaded:  'info',
  analyzing: 'violet',
  analyzed:  'success',
  editing:   'warning',
  exporting: 'warning',
  done:      'success',
  error:     'error',
}

export function ProjectCard({ project }: ProjectCardProps) {
  const styleInfo = STYLE_INFO[project.style]

  return (
    <Link href={`/projects/${project.id}`} className="group block">
      <div
        className={cn(
          'rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden',
          'transition-all duration-200',
          'hover:border-zinc-700 hover:shadow-lg hover:shadow-zinc-950/50',
          'hover:-translate-y-0.5'
        )}
      >
        {/* Thumbnail */}
        <div className="relative h-40 bg-zinc-800 overflow-hidden">
          {project.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.thumbnail}
              alt={project.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Video className="h-10 w-10 text-zinc-700" />
            </div>
          )}
          {/* Status badge overlay */}
          <div className="absolute top-3 left-3">
            <Badge
              variant={statusVariant[project.status] || 'default'}
              dot={project.status === 'analyzing' || project.status === 'exporting'}
            >
              {PROJECT_STATUS_LABELS[project.status] || project.status}
            </Badge>
          </div>
          {/* Duration */}
          {project.duration && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md bg-zinc-950/80 px-2 py-1 text-xs text-zinc-300 backdrop-blur-sm">
              <Clock className="h-3 w-3" />
              {formatDurationVerbose(project.duration)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="text-sm font-semibold text-zinc-100 line-clamp-2 leading-snug flex-1">
              {project.name}
            </h3>
            <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 shrink-0 mt-0.5 transition-colors" />
          </div>

          {/* Style tag */}
          {styleInfo && (
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-xs">{styleInfo.icon}</span>
              <span className="text-xs text-zinc-500">{styleInfo.label}</span>
            </div>
          )}

          {/* Meta row */}
          <div className="flex items-center justify-between text-xs text-zinc-600">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Layers className="h-3 w-3" />
                {project.clipsCount} clip{project.clipsCount !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                {project.exportsCount}
              </span>
            </div>
            <span>{formatRelativeDate(project.updatedAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
