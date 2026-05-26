'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Video,
  FolderOpen,
  Music2,
  Download,
  Settings,
  Plus,
  Sparkles,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const navItems = [
  {
    label: 'Proyectos',
    href: '/projects',
    icon: FolderOpen,
    exact: false,
  },
  {
    label: 'Nuevo vídeo',
    href: '/upload',
    icon: Plus,
    exact: true,
    highlight: true,
  },
  {
    label: 'Biblioteca musical',
    href: '/music',
    icon: Music2,
    exact: false,
  },
  {
    label: 'Exportaciones',
    href: '/exports',
    icon: Download,
    exact: false,
  },
  {
    label: 'Ajustes',
    href: '/settings',
    icon: Settings,
    exact: false,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className="flex h-full w-60 flex-col border-r border-zinc-800 bg-zinc-950">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-zinc-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 shadow-lg shadow-violet-600/30">
          <Zap className="h-4 w-4 text-white" fill="currentColor" />
        </div>
        <div>
          <span className="text-sm font-bold text-zinc-50 tracking-tight">AI Video</span>
          <span className="text-sm font-bold gradient-text ml-1">Studio</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const active = isActive(item.href, item.exact ?? false)
          const Icon = item.icon

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  'bg-violet-600 text-white hover:bg-violet-500',
                  'shadow-md shadow-violet-600/25 mb-2'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-zinc-800 text-zinc-50 border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors',
                  active ? 'text-violet-400' : 'text-zinc-500 group-hover:text-zinc-400'
                )}
              />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* AI badge footer */}
      <div className="px-3 py-4 border-t border-zinc-800">
        <div className="flex items-center gap-2 rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2.5">
          <Sparkles className="h-3.5 w-3.5 text-violet-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-zinc-300 truncate">IA lista</p>
            <p className="text-xs text-zinc-600 truncate">Análisis + generación</p>
          </div>
          <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
        </div>
      </div>
    </aside>
  )
}
