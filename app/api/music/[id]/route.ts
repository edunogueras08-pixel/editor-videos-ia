import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { deleteFile } from '@/lib/storage/fileStorage'

interface Params {
  params: Promise<{ id: string }>
}

// GET /api/music/[id]
export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  try {
    const music = await prisma.music.findUnique({ where: { id } })
    if (!music) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json({ music })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// DELETE /api/music/[id]
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  try {
    const music = await prisma.music.findUnique({ where: { id } })
    if (!music) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

    // Eliminar fichero físico
    await deleteFile(music.filePath)

    // Eliminar de DB
    await prisma.music.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[DELETE /api/music/:id]', error)
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  }
}

// PATCH /api/music/[id] — Actualiza metadatos
export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params
  try {
    const body = await req.json()
    const music = await prisma.music.update({
      where: { id },
      data: {
        name:   body.name   || undefined,
        artist: body.artist !== undefined ? body.artist : undefined,
        tone:   body.tone   || undefined,
      },
    })
    return NextResponse.json({ music })
  } catch {
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}
