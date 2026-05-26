import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import { ProjectWorkspace } from './ProjectWorkspace'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const project = await prisma.project.findUnique({ where: { id } })
  return { title: project?.name || 'Proyecto' }
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      analysis: true,
      clips: { orderBy: { score: 'desc' } },
      exports: { orderBy: { createdAt: 'desc' } },
      music: true,
    },
  })

  if (!project) notFound()

  // Serializar para el cliente
  const serialized = {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    duration: project.duration,
    videoPath: project.videoPath,
    videoName: project.videoName,
    videoSize: project.videoSize,
    thumbnail: project.thumbnail,
    style: project.style,
    styleRef: project.styleRef,
    musicId: project.musicId,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    analysis: project.analysis
      ? {
          id: project.analysis.id,
          highlights:    project.analysis.highlights ? JSON.parse(project.analysis.highlights) : [],
          suggestedCuts: project.analysis.suggestedCuts ? JSON.parse(project.analysis.suggestedCuts) : [],
          structure:     project.analysis.structure ? JSON.parse(project.analysis.structure) : null,
          keyMoments:    project.analysis.keyMoments ? JSON.parse(project.analysis.keyMoments) : [],
          silences:      project.analysis.silences ? JSON.parse(project.analysis.silences) : [],
          zoomPoints:    project.analysis.zoomPoints ? JSON.parse(project.analysis.zoomPoints) : [],
          totalScore:    project.analysis.totalScore,
          wordCount:     project.analysis.wordCount,
          transcript:    project.analysis.transcript,
          createdAt:     project.analysis.createdAt.toISOString(),
        }
      : null,
    clips: project.clips.map(c => ({
      id:          c.id,
      title:       c.title,
      description: c.description,
      startTime:   c.startTime,
      endTime:     c.endTime,
      duration:    c.duration,
      reason:      c.reason,
      score:       c.score,
      format:      c.format,
      status:      c.status,
      outputPath:  c.outputPath,
      hasSubtitles:c.hasSubtitles,
      hasZoom:     c.hasZoom,
      platform:    c.platform,
    })),
    exports: project.exports.map(e => ({
      id:         e.id,
      type:       e.type,
      clipId:     e.clipId,
      format:     e.format,
      resolution: e.resolution,
      status:     e.status,
      outputPath: e.outputPath,
      fileSize:   e.fileSize,
      duration:   e.duration,
      progress:   e.progress,
      createdAt:  e.createdAt.toISOString(),
    })),
    music: project.music
      ? {
          id:       project.music.id,
          name:     project.music.name,
          artist:   project.music.artist,
          tone:     project.music.tone,
          duration: project.music.duration,
          filePath: project.music.filePath,
        }
      : null,
  }

  return <ProjectWorkspace project={serialized} />
}
