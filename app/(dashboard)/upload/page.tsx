'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UploadDropZone } from '@/components/upload/DropZone'
import { StyleSelector } from '@/components/project/StyleSelector'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { formatFileSize } from '@/lib/utils/formatters'
import { Video, ArrowRight, CheckCircle2, Info } from 'lucide-react'

type Step = 'file' | 'style' | 'uploading' | 'done'

export default function UploadPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('file')
  const [file, setFile] = useState<File | null>(null)
  const [projectName, setProjectName] = useState('')
  const [style, setStyle] = useState('professional')
  const [styleRef, setStyleRef] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  function handleFileAccepted(acceptedFile: File) {
    setFile(acceptedFile)
    // Auto-generate project name from filename
    const nameWithoutExt = acceptedFile.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
    setProjectName(nameWithoutExt)
    setStep('style')
  }

  async function handleSubmit() {
    if (!file) return
    setStep('uploading')
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', projectName || file.name)
      formData.append('style', style)
      formData.append('styleRef', styleRef)

      // Simular progreso de subida
      const progressInterval = setInterval(() => {
        setUploadProgress(p => {
          if (p >= 90) { clearInterval(progressInterval); return p }
          return p + Math.random() * 15
        })
      }, 400)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al subir el vídeo')
      }

      const { projectId } = await res.json()
      setStep('done')

      // Redirigir al proyecto tras 1.5s
      setTimeout(() => router.push(`/projects/${projectId}`), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setStep('style')
    }
  }

  return (
    <div className="px-8 py-8 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-50">Nuevo proyecto</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Sube tu vídeo y configura el estilo de edición
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {(['file', 'style', 'uploading'] as const).map((s, i) => {
          const stepLabels = { file: 'Vídeo', style: 'Estilo', uploading: 'Subida' }
          const current = step === s
          const done = ['file', 'style', 'uploading'].indexOf(step) > i

          return (
            <div key={s} className="flex items-center gap-3">
              <div className={`flex items-center gap-2 ${current || done ? 'text-violet-400' : 'text-zinc-600'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                  done
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : current
                    ? 'border-violet-500 bg-violet-500/10 text-violet-400'
                    : 'border-zinc-700 text-zinc-600'
                }`}>
                  {done ? '✓' : i + 1}
                </div>
                <span className="text-sm font-medium">{stepLabels[s]}</span>
              </div>
              {i < 2 && <div className="w-8 h-px bg-zinc-800" />}
            </div>
          )
        })}
      </div>

      {/* ── STEP 1: FILE ── */}
      {step === 'file' && (
        <UploadDropZone onFileAccepted={handleFileAccepted} />
      )}

      {/* ── STEP 2: STYLE ── */}
      {step === 'style' && file && (
        <div className="space-y-6">
          {/* File info */}
          <Card>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20">
                <Video className="h-5 w-5 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-100 truncate">{file.name}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{formatFileSize(file.size)}</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            </div>
          </Card>

          {/* Project name */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Nombre del proyecto
            </label>
            <input
              type="text"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              placeholder="Nombre de tu vídeo..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          {/* Style selector */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">
              Estilo de edición
            </label>
            <StyleSelector value={style} onChange={setStyle} />
          </div>

          {/* Style reference */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-medium text-zinc-300">
                Referencia de estilo
              </label>
              <span className="text-xs text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">Opcional</span>
            </div>
            <div className="flex items-start gap-2 mb-2 text-xs text-zinc-500 bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-zinc-500" />
              <span>
                Describe cómo quieres que se edite tu vídeo. La IA usará esto como guía para
                tomar decisiones de edición.
              </span>
            </div>
            <textarea
              value={styleRef}
              onChange={e => setStyleRef(e.target.value)}
              rows={3}
              placeholder='Ej: "Quiero cortes limpios, zooms sutiles en frases clave, subtítulos dinámicos solo en momentos importantes, música motivacional suave y una estructura con gancho, desarrollo y cierre."'
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none leading-relaxed"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => { setStep('file'); setFile(null) }}
            >
              Volver
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              icon={<ArrowRight className="h-4 w-4" />}
              iconPosition="right"
              onClick={handleSubmit}
              disabled={!projectName.trim()}
            >
              Crear proyecto y subir
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 3: UPLOADING ── */}
      {step === 'uploading' && (
        <Card className="text-center py-12">
          <div className="mb-6 flex justify-center">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
              <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
            </div>
          </div>
          <h2 className="text-lg font-semibold text-zinc-100 mb-1">Subiendo vídeo...</h2>
          <p className="text-sm text-zinc-500 mb-6">{file?.name}</p>
          <div className="max-w-xs mx-auto">
            <Progress value={Math.round(uploadProgress)} showLabel color="violet" size="md" />
          </div>
        </Card>
      )}

      {/* ── STEP 4: DONE ── */}
      {step === 'done' && (
        <Card className="text-center py-12">
          <div className="mb-4 flex justify-center">
            <CheckCircle2 className="h-14 w-14 text-emerald-400" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-100 mb-1">¡Proyecto creado!</h2>
          <p className="text-sm text-zinc-500">Redirigiendo al proyecto...</p>
        </Card>
      )}
    </div>
  )
}
