import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { analyzeVideo } from '@/lib/ai/analyzer'

interface Params {
  params: Promise<{ id: string }>
}

// POST /api/projects/[id]/analyze — Analiza el vídeo con IA
export async function POST(req: Request, { params }: Params) {
  const { id } = await params
  try {
    const project = await prisma.project.findUnique({ where: { id } })
    if (!project) return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })

    const body = await req.json().catch(() => ({}))
    const style    = body.style    || project.style    || 'professional'
    const styleRef = body.styleRef || project.styleRef || null

    // Marcar como analizando
    await prisma.project.update({ where: { id }, data: { status: 'analyzing' } })

    // Ejecutar análisis IA (simulado o real)
    const duration = project.duration || 600
    const result = await analyzeVideo(project.videoPath || '', duration, style)

    // Guardar o actualizar análisis en DB
    const analysis = await prisma.analysis.upsert({
      where:  { projectId: id },
      create: {
        projectId:     id,
        highlights:    JSON.stringify(result.highlights),
        suggestedCuts: JSON.stringify(result.suggestedCuts),
        structure:     JSON.stringify(result.structure),
        keyMoments:    JSON.stringify(result.keyMoments),
        silences:      JSON.stringify(result.silences),
        zoomPoints:    JSON.stringify(result.zoomPoints),
        transcript:    result.transcript,
        totalScore:    result.totalScore,
        wordCount:     result.wordCount,
      },
      update: {
        highlights:    JSON.stringify(result.highlights),
        suggestedCuts: JSON.stringify(result.suggestedCuts),
        structure:     JSON.stringify(result.structure),
        keyMoments:    JSON.stringify(result.keyMoments),
        silences:      JSON.stringify(result.silences),
        zoomPoints:    JSON.stringify(result.zoomPoints),
        transcript:    result.transcript,
        totalScore:    result.totalScore,
        wordCount:     result.wordCount,
      },
    })

    // Actualizar styleRef y status
    await prisma.project.update({
      where: { id },
      data:  { status: 'analyzed', styleRef: styleRef || project.styleRef },
    })

    // Devolver análisis deserializado para el cliente
    return NextResponse.json({
      analysis: {
        id:            analysis.id,
        highlights:    result.highlights,
        suggestedCuts: result.suggestedCuts,
        structure:     result.structure,
        keyMoments:    result.keyMoments,
        silences:      result.silences,
        zoomPoints:    result.zoomPoints,
        totalScore:    result.totalScore,
        wordCount:     result.wordCount,
        transcript:    result.transcript,
        createdAt:     analysis.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('[POST /api/projects/:id/analyze]', error)
    await prisma.project.update({ where: { id }, data: { status: 'error' } }).catch(() => {})
    return NextResponse.json({ error: 'Error al analizar el vídeo' }, { status: 500 })
  }
}
