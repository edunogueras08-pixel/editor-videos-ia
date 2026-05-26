import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { deleteFile } from '@/lib/storage/fileStorage'

interface Params {
  params: Promise<{ id: string }>
}

// GET /api/projects/[id]
export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        analysis: true,
        clips: { orderBy: { score: 'desc' } },
        exports: { orderBy: { createdAt: 'desc' } },
        music: true,
      },
    })
    if (!project) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json({ project })
  } catch (error) {
    console.error('[GET /api/projects/:id]', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// PATCH /api/projects/[id] — Actualiza campos del proyecto
export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params
  try {
    const body = await req.json()
    const allowed = ['name', 'description', 'style', 'styleRef', 'musicId', 'status']
    const data = Object.fromEntries(
      Object.entries(body).filter(([k]) => allowed.includes(k))
    )

    const project = await prisma.project.update({
      where: { id },
      data,
    })
    return NextResponse.json({ project })
  } catch (error) {
    console.error('[PATCH /api/projects/:id]', error)
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}

// DELETE /api/projects/[id]
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  try {
    const project = await prisma.project.findUnique({ where: { id } })
    if (!project) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

    // Eliminar fichero de vídeo
    if (project.videoPath) await deleteFile(project.videoPath)
    if (project.thumbnail) await deleteFile(project.thumbnail)

    await prisma.project.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[DELETE /api/projects/:id]', error)
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  }
}
