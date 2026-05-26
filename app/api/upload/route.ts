import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { saveFile, generateFileName, ALLOWED_TYPES, MAX_SIZES } from '@/lib/storage/fileStorage'

// POST /api/upload — Sube un vídeo y crea el proyecto
export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file     = formData.get('file') as File | null
    const name     = (formData.get('name') as string | null) || 'Sin título'
    const style    = (formData.get('style') as string | null) || 'professional'
    const styleRef = (formData.get('styleRef') as string | null) || null

    if (!file) {
      return NextResponse.json({ error: 'No se ha enviado ningún fichero' }, { status: 400 })
    }

    // Validar tipo de archivo
    if (!ALLOWED_TYPES.videos.includes(file.type)) {
      return NextResponse.json(
        { error: `Tipo no soportado: ${file.type}. Usa MP4, MOV, AVI o WebM.` },
        { status: 400 }
      )
    }

    // Validar tamaño
    if (file.size > MAX_SIZES.videos) {
      return NextResponse.json(
        { error: 'El fichero supera el máximo de 10 GB' },
        { status: 400 }
      )
    }

    // Leer el buffer del fichero
    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Guardar en disco
    const fileName = generateFileName(file.name, 'video')
    const videoPath = await saveFile(buffer, fileName, 'videos')

    // Obtener duración simulada (FFmpeg real en producción)
    // En producción: usar ffprobe para obtener la duración real
    const estimatedDuration = estimateDurationFromSize(file.size)

    // Crear proyecto en la base de datos
    const project = await prisma.project.create({
      data: {
        name:      name.trim(),
        status:    'uploaded',
        videoPath,
        videoName: file.name,
        videoSize: file.size,
        duration:  estimatedDuration,
        style,
        styleRef,
      },
    })

    return NextResponse.json({ projectId: project.id, project }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/upload]', error)
    return NextResponse.json({ error: 'Error al subir el vídeo' }, { status: 500 })
  }
}

/**
 * Estima la duración de un vídeo basándose en el tamaño del fichero.
 * [REAL FFMPEG] En producción, usar ffprobe para obtener la duración exacta.
 *
 * Estimación aproximada: 1 GB ≈ 15 min a 720p H.264
 */
function estimateDurationFromSize(bytes: number): number {
  const MB = bytes / (1024 * 1024)
  // ~8 MB/min para 720p, ~16 MB/min para 1080p
  // Usamos un promedio de 12 MB/min
  return Math.max(60, (MB / 12) * 60)
}
