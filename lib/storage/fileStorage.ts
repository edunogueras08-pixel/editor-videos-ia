/**
 * File Storage Service
 * Gestiona la escritura/lectura de ficheros en disco.
 * Preparado para migrar a S3/Cloudflare R2 simplemente
 * reemplazando esta implementación.
 */
import fs from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const EXPORT_DIR = path.join(process.cwd(), 'public', 'exports')

export const StoragePaths = {
  videos: path.join(UPLOAD_DIR, 'videos'),
  music: path.join(UPLOAD_DIR, 'music'),
  thumbnails: path.join(UPLOAD_DIR, 'thumbnails'),
  exports: EXPORT_DIR,
}

/** Garantiza que existe el directorio */
async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true })
}

/** Guarda un archivo en disco y devuelve la ruta relativa pública */
export async function saveFile(
  buffer: Buffer,
  filename: string,
  category: 'videos' | 'music' | 'thumbnails' | 'exports'
): Promise<string> {
  const dir = StoragePaths[category]
  await ensureDir(dir)
  const filePath = path.join(dir, filename)
  await fs.writeFile(filePath, buffer)
  // Ruta pública para servir desde Next.js
  return `/uploads/${category}/${filename}`
}

/** Elimina un fichero por su ruta relativa pública */
export async function deleteFile(publicPath: string): Promise<void> {
  try {
    const absolutePath = path.join(process.cwd(), 'public', publicPath)
    await fs.unlink(absolutePath)
  } catch {
    // Silenciar si no existe
  }
}

/** Comprueba si un fichero existe */
export async function fileExists(publicPath: string): Promise<boolean> {
  try {
    const absolutePath = path.join(process.cwd(), 'public', publicPath)
    await fs.access(absolutePath)
    return true
  } catch {
    return false
  }
}

/** Obtiene el tamaño de un fichero en bytes */
export async function getFileSize(publicPath: string): Promise<number> {
  try {
    const absolutePath = path.join(process.cwd(), 'public', publicPath)
    const stat = await fs.stat(absolutePath)
    return stat.size
  } catch {
    return 0
  }
}

/** Genera un nombre único para un fichero */
export function generateFileName(originalName: string, prefix?: string): string {
  const ext = path.extname(originalName).toLowerCase()
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const base = prefix ? `${prefix}_` : ''
  return `${base}${timestamp}_${random}${ext}`
}

/** Tipos de archivo permitidos por categoría */
export const ALLOWED_TYPES = {
  videos: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/mpeg'],
  music: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac'],
}

/** Tamaños máximos en bytes */
export const MAX_SIZES = {
  videos: 10 * 1024 * 1024 * 1024, // 10 GB
  music: 100 * 1024 * 1024,         // 100 MB
}
