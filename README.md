# 🎬 AI Video Studio

Aplicación web profesional para editar vídeos de YouTube con inteligencia artificial.
Detecta momentos importantes, sugiere cortes, genera clips virales y exporta con calidad profesional.

## ✨ Características principales

### Edición de vídeo largo
- 🧠 **Análisis IA** — detecta highlights, silencios y momentos clave
- ✂️ **Cortes sugeridos** — elimina pausas, rellenos y partes aburridas  
- 📐 **Estructura automática** — gancho, intro, desarrollo, momentos clave y cierre
- 🔍 **Zooms sutiles** — en frases importantes
- 💬 **Subtítulos inteligentes** — solo en momentos clave
- 🎬 **5 estilos de edición** — profesional, dinámico, storytelling, educativo, minimalista
- 📝 **Referencia de estilo** — descripción libre para guiar la IA

### Clips cortos virales
- 📱 **Formato vertical 9:16** — TikTok, Shorts y Reels
- ⚡ **15-60 segundos** — duración óptima decidida por IA
- 📊 **Score viral** — puntuación de potencial de cada clip

### Biblioteca musical
- 🎵 Sube tu propia música · 6 tonos · ducking automático · control de volumen

---

## 🚀 Inicio rápido

### Requisitos
- Node.js 18+
- npm

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar entorno
```bash
cp .env.example .env
# El archivo ya tiene DATABASE_URL para SQLite local
```

### 3. Crear la base de datos
```bash
npx prisma generate
npx prisma db push
```

### 4. Arrancar en desarrollo
```bash
npm run dev
```

Abre http://localhost:3000 — te redirigirá a `/projects`.

---

## 📂 Estructura del proyecto

```
app/
  (dashboard)/           # Rutas con sidebar
    projects/page.tsx    # Dashboard de proyectos
    projects/[id]/       # Detalle del proyecto
    upload/page.tsx      # Subir vídeo
    music/page.tsx       # Biblioteca musical
    exports/page.tsx     # Exportaciones
    settings/page.tsx    # Ajustes
  api/
    upload/              # POST: subir vídeo
    projects/[id]/
      analyze/           # POST: análisis IA
      clips/             # GET/POST: clips
      export/            # GET/POST: exportar
    music/               # Biblioteca musical
lib/
  ai/                    # Servicios IA (simulados → preparados para real)
  ffmpeg/                # Procesamiento vídeo (preparado para fluent-ffmpeg)
  storage/               # Gestión de ficheros
  db/                    # Cliente Prisma singleton
components/
  layout/Sidebar.tsx
  ui/                    # Button, Badge, Card, Progress
  project/               # VideoPlayer, AnalysisPanel, ClipCard, etc.
  upload/DropZone.tsx
prisma/schema.prisma     # Project, Analysis, Clip, Music, Export
```

---

## 🔌 Integraciones futuras (estructura preparada)

### IA Real
```bash
# Descomentar en lib/ai/analyzer.ts:
# OpenAI Whisper para transcripción
# Claude API / GPT-4 para análisis de contenido
```

### FFmpeg Real
```bash
npm install fluent-ffmpeg @ffmpeg-installer/ffmpeg
# Descomentar código en lib/ffmpeg/processor.ts
```

### PostgreSQL para producción
```prisma
# En prisma/schema.prisma:
datasource db { provider = "postgresql" }
```

---

## 🔄 Qué es real vs simulado (v1.0)

| Función | Estado |
|---------|--------|
| Subida de vídeo | ✅ Real |
| Guardado de proyectos | ✅ Real (SQLite) |
| Biblioteca musical | ✅ Real |
| Video player HTML5 | ✅ Real |
| Análisis IA | 🟡 Simulado → preparado para Claude/GPT |
| Generación de clips | 🟡 Simulado → metadatos reales en DB |
| Procesamiento FFmpeg | 🟡 Simulado → activar con fluent-ffmpeg |
| Exportación | 🟡 Simulado → metadatos reales, fichero con FFmpeg |

---

## 💾 Git — Guardar el trabajo

### Primer commit
```bash
git add .
git commit -m "feat: AI Video Studio v1.0 — base completa"
```

### Subir a GitHub
```bash
git remote add origin https://github.com/TU_USUARIO/ai-video-studio.git
git branch -M main
git push -u origin main
```

### Flujo de trabajo diario
```bash
git pull                                    # antes de trabajar
git add . && git commit -m "feat: ..." && git push   # al terminar
```

---

## 🛠️ Comandos útiles

```bash
npm run dev                          # Servidor de desarrollo
npx prisma studio                    # Ver DB en el navegador  
npx prisma migrate dev --name init   # Crear migración
npx prisma db push                   # Sincronizar schema sin migración
npx tsc --noEmit                     # Verificar TypeScript
npm run build                        # Build de producción
```

---

## 📋 Próximos pasos

1. Conectar **OpenAI Whisper** para transcripción real
2. Conectar **Claude API** para análisis de contenido
3. Instalar **fluent-ffmpeg** para procesamiento real
4. Migrar a **PostgreSQL** para producción
5. Añadir **autenticación** (NextAuth.js / Clerk)
6. Cola de trabajos con **Inngest** o **BullMQ**
7. Almacenamiento en **Cloudflare R2** o **AWS S3**
8. Deploy en **Vercel** o servidor dedicado

---

Made with ❤️ + 🤖 — AI Video Studio v1.0
