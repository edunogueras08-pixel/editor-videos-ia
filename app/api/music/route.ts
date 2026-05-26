import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { saveFile, generateFileName, ALLOWED_TYPES, MAX_SIZES } from '@/lib/storage/fileStorage'

// GET /api/music — Lista la biblioteca musical
export async function GET() {
  try {
    const music = await prisma.music.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ music })
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener música' }, { status: 500 })
  }
}

// POST /api/music — Sube una nueva pista
export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file     = formData.get('file') as File | null
    const name     = (formData.get('name') as string | null)?.trim() || 'Sin nombre'
    const artist   = (formData.get('artist') as string | null)?.trim() || null
    const tone     = (formData.get('tone') as string | null) || 'calm'

    if (!file) {
      return NextResponse.json({ error: 'No se ha enviado ningún fichero' }, { status: 400 })
    }

    // Validar tipo de audio
    const isValidType = ALLOWED_TYPES.music.some(t => file.type.startsWith(t.split('/')[0]))
    if (!isValidType && !file.type.startsWith('audio/')) {
      return NextResponse.json({ error: 'Tipo de audio no soportado' }, { status: 400 })
    }

    if (file.size > MAX_SIZES.music) {
      return NextResponse.json({ error: 'El fichero supera los 100 MB' }, { status: 400 })
    }

    // Guardar fichero
    const bytes    = await file.arrayBuffer()
    const buffer   = Buffer.from(bytes)
    const fileName = generateFileName(file.name, 'music')
    const filePath = await saveFile(buffer, fileName, 'music')

    // Guardar en DB
    const music = await prisma.music.create({
      data: {
        name,
        artist,
        tone,
        filePath,
        fileName: file.name,
        fileSize: file.size,
      },
    })

    return NextResponse.json({ music }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/music]', error)
    return NextResponse.json({ error: 'Error al subir la música' }, { status: 500 })
  }
}
