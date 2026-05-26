import Link from 'next/link'
import { Plus, Video, FolderOpen, Sparkles } from 'lucide-react'
import { prisma } from '@/lib/db/prisma'
import { ProjectCard } from '@/components/project/ProjectCard'
import { Button } from '@/components/ui/Button'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mis Proyectos' }

// Forzar render dinámico para siempre leer DB actualizada
export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: { select: { clips: true, exports: true } },
    },
  })

  return (
    <div className="px-8 py-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-50">Mis proyectos</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {projects.length === 0
              ? 'Sube tu primer vídeo para empezar'
              : `${projects.length} proyecto${projects.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link href="/upload">
          <Button variant="primary" icon={<Plus className="h-4 w-4" />}>
            Nuevo proyecto
          </Button>
        </Link>
      </div>

      {/* Stats bar */}
      {projects.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Total proyectos"
            value={projects.length}
            icon={<FolderOpen className="h-4 w-4 text-violet-400" />}
          />
          <StatCard
            label="Clips generados"
            value={projects.reduce((acc: number, p) => acc + p._count.clips, 0)}
            icon={<Video className="h-4 w-4 text-emerald-400" />}
          />
          <StatCard
            label="Exportaciones"
            value={projects.reduce((acc: number, p) => acc + p._count.exports, 0)}
            icon={<Sparkles className="h-4 w-4 text-amber-400" />}
          />
        </div>
      )}

      {/* Projects grid */}
      {projects.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={{
                id:          project.id,
                name:        project.name,
                status:      project.status,
                duration:    project.duration,
                thumbnail:   project.thumbnail,
                style:       project.style,
                createdAt:   project.createdAt.toISOString(),
                updatedAt:   project.updatedAt.toISOString(),
                clipsCount:  project._count.clips,
                exportsCount:project._count.exports,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800">
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-zinc-50">{value}</p>
        <p className="text-xs text-zinc-500">{label}</p>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900">
        <Video className="h-9 w-9 text-zinc-600" />
      </div>
      <h2 className="text-xl font-semibold text-zinc-200 mb-2">
        Empieza tu primer proyecto
      </h2>
      <p className="text-sm text-zinc-500 max-w-sm mb-8 leading-relaxed">
        Sube un vídeo de YouTube, analízalo con IA y genera una edición
        profesional o clips virales en minutos.
      </p>
      <Link href="/upload">
        <Button variant="primary" size="lg" icon={<Plus className="h-4 w-4" />}>
          Subir primer vídeo
        </Button>
      </Link>
    </div>
  )
}
