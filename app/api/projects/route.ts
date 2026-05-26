import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// GET /api/projects — Lista todos los proyectos
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { clips: true, exports: true } },
      },
    })
    return NextResponse.json({ projects })
  } catch (error) {
    console.error('[GET /api/projects]', error)
    return NextResponse.json({ error: 'Error al obtener proyectos' }, { status: 500 })
  }
}
