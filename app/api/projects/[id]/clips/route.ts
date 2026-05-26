import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { generateClipSuggestions } from '@/lib/ai/clipGenerator'

interface Params {
  params: Promise<{ id: string }>
}

// GET /api/projects/[id]/clips — Lista los clips del proyecto
export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  try {
    const clips = await prisma.clip.findMany({
      where: { projectId: id },
      orderBy: { score: 'desc' },
    })
    return NextResponse.json({ clips })
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener clips' }, { status: 500 })
  }
}

// POST /api/projects/[id]/clips — Genera clips del vídeo
export async function POST(_req: Request, { params }: Params) {
  const { id } = await params
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { analysis: true },
    })

    if (!project) return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
    if (!project.analysis) {
      return NextResponse.json(
        { error: 'Primero debes analizar el vídeo con IA' },
        { status: 400 }
      )
    }

    const highlights = project.analysis.highlights
      ? JSON.parse(project.analysis.highlights)
      : []

    // Generar sugerencias de clips
    const suggestions = await generateClipSuggestions(
      highlights,
      project.duration || 600,
      project.style
    )

    // Eliminar clips anteriores del proyecto
    await prisma.clip.deleteMany({ where: { projectId: id } })

    // Crear los nuevos clips en la DB
    const clips = await prisma.$transaction(
      suggestions.map(s =>
        prisma.clip.create({
          data: {
            projectId:    id,
            title:        s.title,
            description:  s.description,
            startTime:    s.startTime,
            endTime:      s.endTime,
            duration:     s.duration,
            reason:       s.reason,
            score:        s.score,
            format:       s.format,
            hasSubtitles: s.hasSubtitles,
            hasZoom:      s.hasZoom,
            platform:     s.platform,
            status:       'pending',
          },
        })
      )
    )

    return NextResponse.json({ clips })
  } catch (error) {
    console.error('[POST /api/projects/:id/clips]', error)
    return NextResponse.json({ error: 'Error al generar clips' }, { status: 500 })
  }
}
