'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { videoEmbedUrl, isEmbeddableVideo, toFa, STATUS_LABEL } from '@/lib/client'
import { X } from 'lucide-react'

export function StatCard({
  title,
  value,
  icon: Icon,
  hint,
  tone = 'default',
}: {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  hint?: string
  tone?: 'default' | 'amber' | 'rose'
}) {
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-4 lg:p-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs lg:text-sm text-muted-foreground">{title}</p>
          <p className="text-xl lg:text-2xl font-extrabold mt-1.5 truncate">
            {typeof value === 'number' ? toFa(value) : value}
          </p>
          {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
        </div>
        <div
          className={cn(
            'w-10 h-10 lg:w-11 lg:h-11 rounded-xl flex items-center justify-center shrink-0',
            tone === 'amber' ? 'bg-amber-100 text-amber-700' : tone === 'rose' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </CardContent>
    </Card>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    COMPLETED: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
    PARTIAL: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
    SKIPPED: 'bg-rose-100 text-rose-800 hover:bg-rose-100',
    ACTIVE: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
    PUBLISHED: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
    PAID: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
    PENDING: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
    CANCELLED: 'bg-rose-100 text-rose-800 hover:bg-rose-100',
    DRAFT: 'bg-stone-200 text-stone-700 hover:bg-stone-200',
    PAUSED: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  }
  return <Badge className={cn('border-transparent', map[status] || 'bg-muted text-muted-foreground hover:bg-muted')}>{STATUS_LABEL[status] || status}</Badge>
}

export function VideoPlayer({ url, title, className }: { url: string | null | undefined; title?: string; className?: string }) {
  const embed = videoEmbedUrl(url)
  if (!embed) {
    return (
      <div className={cn('aspect-video rounded-lg bg-muted flex items-center justify-center text-sm text-muted-foreground', className)}>
        ویدئویی برای این حرکت ثبت نشده است
      </div>
    )
  }
  if (isEmbeddableVideo(embed)) {
    return (
      <video src={embed} controls playsInline className={cn('aspect-video w-full rounded-lg bg-black object-contain', className)} />
    )
  }
  return (
    <iframe
      src={embed}
      title={title || 'ویدئوی آموزشی'}
      className={cn('aspect-video w-full rounded-lg border-0', className)}
      allowFullScreen
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    />
  )
}

export function LoadingList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-xl" />
      ))}
    </div>
  )
}

export function EmptyState({ title, description, icon: Icon }: { title: string; description?: string; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 text-muted-foreground" />
        </div>
      )}
      <p className="font-semibold">{title}</p>
      {description && <p className="text-sm text-muted-foreground mt-1.5 max-w-sm leading-relaxed">{description}</p>}
    </div>
  )
}

export function VideoDialog({ url, title, onClose }: { url: string | null; title: string; onClose: () => void }) {
  if (!url) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-bold">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="بستن">
            <X className="w-5 h-5 text-white" />
          </Button>
        </div>
        <VideoPlayer url={url} title={title} />
      </div>
    </div>
  )
}
