import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { generateFileName } from '@/lib/storage/fileStorage'

interface Params {
  params: Promise<{ id: string }>
}

// POST /api/projects/[id]/export — Crea una exportación
export async function POST(req: Request, { params }: Params) {
  const { id } = await params
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { analysis: true },
    })

    if (!project) return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })

    const body       = await req.json()
    const type       = body.type       || 'long'       // 'long' | 'clip'
    const clipId     = body.clipId     || null
    const resolution = body.resolution || '1080p'
    const format     = body.format     || 'mp4'

    // Validar clip si es exportación de clip
    if (type === 'clip' && clipId) {
      const clip = await prisma.clip.findUnique({ where: { id: clipId } })
      if (!clip) return NextResponse.json({ error: 'Clip no encontrado' }, { status: 404 })
    }

    // Generar nombre de fichero de salida
    const outputFileName = generateFileName(
      `${project.name}_${type}_${resolution}.${format}`,
      type
    )
    const outputPath = `/exports/${outputFileName}`

    // Crear registro de exportación (estado: processing)
    const exportRecord = await prisma.export.create({
      data: {
        projectId:  id,
        clipId:     clipId || null,
        type,
        format,
        resolution,
        status:     'processing',
        outputPath,
        progress:   0,
      },
    })

    // [REAL FFMPEG] Aquí se dispararía el procesamiento real en background:
    // - Aplicar cortes sugeridos al vídeo
    // - Añadir música de fondo con ducking
    // - Quemar subtítulos en momentos clave
    // - Aplicar zooms en highlights
    // - Convertir a formato/resolución deseada
    //
    // Por ahora, simulamos el procesamiento con un timeout
    simulateProcessing(exportRecord.id).catch(console.error)

    return NextResponse.json({ export: { ...exportRecord, createdAt: exportRecord.createdAt.toISOString() } }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/projects/:id/export]', error)
    return NextResponse.json({ error: 'Error al crear exportación' }, { status: 500 })
  }
}

// GET /api/projects/[id]/export — Lista exportaciones del proyecto
export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  try {
    const exports = await prisma.export.findMany({
      where: { projectId: id },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ exports })
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener exportaciones' }, { status: 500 })
  }
}

/**
 * [SIMULADO] Simula el procesamiento de la exportación.
 * En producción, esto sería un worker/job de background con FFmpeg.
 */
async function simulateProcessing(exportId: string): Promise<void> {
  const steps = [25, 50, 75, 100]

  for (const step of steps) {
    await new Promise(r => setTimeout(r, 2000 + Math.random() * 1000))
    await prisma.export.update({
      where: { id: exportId },
      data: {
        progress: step,
        status: step === 100 ? 'ready' : 'processing',
        fileSize: step === 100 ? Math.floor(Math.random() * 800_000_000 + 100_000_000) : undefined,
        duration: step === 100 ? Math.floor(Math.random() * 3600 + 300) : undefined,
      },
    }).catch(() => {})
  }
}
