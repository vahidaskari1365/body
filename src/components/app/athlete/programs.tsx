'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useFetch, toFa } from '@/lib/client'
import { LoadingList, EmptyState, VideoDialog, StatusBadge } from '@/components/app/shared/ui-bits'
import { ClipboardList, PlayCircle, ChevronRight, CheckCircle2, PenLine } from 'lucide-react'

interface SessionExerciseItem {
  id: string
  exercise: { id: string; name: string; videoUrl?: string | null; instructions?: string | null; category: string }
  sets: number
  reps: string
  weight?: string | null
  restSeconds: number
  notes?: string | null
}

interface Session {
  id: string
  title: string
  weekNumber: number
  dayNumber: number
  dayLabel?: string | null
  focus?: string | null
  exercises: SessionExerciseItem[]
  logs: { id: string; status: string }[]
}

interface Assignment {
  id: string
  startDate: string
  status: string
  program: {
    id: string
    title: string
    description?: string | null
    durationWeeks: number
    coach: { name: string }
    sessions: Session[]
  }
}

export function AthletePrograms({ onStartLog }: { onStartLog: (sessionId?: string) => void }) {
  const { data, loading } = useFetch<{ assignments: Assignment[] }>('/api/athlete/programs')
  const [video, setVideo] = useState<{ url: string; title: string } | null>(null)

  if (loading) return <div className="p-6"><LoadingList rows={3} /></div>
  const assignments = data?.assignments || []

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl lg:text-2xl font-extrabold">برنامه تمرینی من</h1>
        <p className="text-sm text-muted-foreground mt-1">جلسات و حرکات با ویدئوی آموزشی</p>
      </div>

      {assignments.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="هنوز برنامه‌ای نداری"
          description="وقتی مربی برایت برنامه تمرینی ارسال کند، اینجا نمایش داده می‌شود"
        />
      ) : (
        assignments.map((a) => (
          <div key={a.id} className="space-y-3">
            <Card>
              <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold">{a.program.title}</h2>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    مربی: {a.program.coach.name} — {toFa(a.program.durationWeeks)} هفته — شروع: {new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(a.startDate))}
                  </p>
                  {a.program.description && <p className="text-xs text-muted-foreground mt-1.5">{a.program.description}</p>}
                </div>
                <Button size="sm" onClick={() => onStartLog()}>
                  <PenLine className="w-4 h-4 ml-1" /> ثبت نتایج
                </Button>
              </CardContent>
            </Card>

            {a.program.sessions.map((s) => {
              const done = s.logs.some((l) => l.status === 'COMPLETED')
              return (
                <Accordion key={s.id} type="single" collapsible>
                  <AccordionItem value={s.id} className="border rounded-xl bg-card px-4">
                    <div className="flex items-center gap-2">
                      <AccordionTrigger className="flex-1 hover:no-underline py-4">
                        <div className="flex items-center gap-3 text-right flex-1">
                          <Badge className={`shrink-0 border-transparent ${done ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            هفته {toFa(s.weekNumber)}
                          </Badge>
                          <div className="min-w-0 text-right">
                            <p className="font-bold text-sm">{s.title}</p>
                            <p className="text-xs text-muted-foreground">{s.dayLabel || ''}{s.focus ? ` — ${s.focus}` : ''}</p>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">{toFa(s.exercises.length)} حرکت</span>
                        </div>
                      </AccordionTrigger>
                      <Button size="sm" variant="outline" className="shrink-0 h-8" onClick={() => onStartLog(s.id)}>
                        ثبت
                      </Button>
                    </div>
                    <AccordionContent className="pb-4">
                      <div className="space-y-2">
                        {s.exercises.map((se, idx) => (
                          <div key={se.id} className="flex items-center gap-3 rounded-xl border bg-background p-3">
                            <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0">
                              {toFa(idx + 1)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm">{se.exercise.name}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {toFa(se.sets)} ست × {toFa(se.reps)} تکرار{se.weight ? ` × ${toFa(se.weight)} کیلو` : ''} — استراحت {toFa(se.restSeconds)} ثانیه
                              </p>
                              {se.notes && <p className="text-[11px] text-amber-700 mt-1">نکته: {se.notes}</p>}
                            </div>
                            {se.exercise.videoUrl && (
                              <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0 text-primary" onClick={() => setVideo({ url: se.exercise.videoUrl!, title: se.exercise.name })} aria-label="ویدئوی آموزشی">
                                <PlayCircle className="w-5 h-5" />
                              </Button>
                            )}
                          </div>
                        ))}
                        {s.exercises.length === 0 && <p className="text-sm text-muted-foreground">حرکتی ثبت نشده</p>}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )
            })}
          </div>
        ))
      )}

      {video && <VideoDialog url={video.url} title={video.title} onClose={() => setVideo(null)} />}
    </div>
  )
}
