'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useFetch, toFa, faDayName, faDateShort } from '@/lib/client'
import { LoadingList, EmptyState, StatusBadge } from '@/components/app/shared/ui-bits'
import { CalendarDays, ChevronRight, ChevronLeft, Clock, Users } from 'lucide-react'

interface CalSession {
  id: string
  title: string
  weekNumber: number
  dayNumber: number
  dayLabel?: string | null
  focus?: string | null
  scheduledDate?: string | null
  program: { id: string; title: string }
  exercises: { exercise: { name: string } }[]
  athletes: string[]
  logs: { athleteId: string; status: string }[]
}

export function CoachCalendar() {
  const { data, loading } = useFetch<{ sessions: CalSession[] }>('/api/coach/calendar')
  const [weekOffset, setWeekOffset] = useState(0)

  const sessions = data?.sessions || []
  const weekNumbers = Array.from(new Set(sessions.map((s) => s.weekNumber))).sort((a, b) => a - b)
  const currentWeek = weekNumbers.length ? weekNumbers[Math.min(Math.max(weekOffset, 0), weekNumbers.length - 1)] : 1
  const weekSessions = sessions.filter((s) => s.weekNumber === currentWeek)
  const DAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه']

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold">تقویم تمرین‌ها</h1>
          <p className="text-sm text-muted-foreground mt-1">برنامه هفتگی جلسات تمام ورزشکاران</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((w) => Math.max(w - 1, 0))}
            className="w-9 h-9 rounded-lg border flex items-center justify-center hover:bg-accent disabled:opacity-40"
            disabled={weekOffset <= 0}
            aria-label="هفته قبل"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <Badge variant="secondary" className="px-4 py-1.5">هفته {toFa(currentWeek)}</Badge>
          <button
            onClick={() => setWeekOffset((w) => Math.min(w + 1, weekNumbers.length - 1))}
            className="w-9 h-9 rounded-lg border flex items-center justify-center hover:bg-accent disabled:opacity-40"
            disabled={weekOffset >= weekNumbers.length - 1}
            aria-label="هفته بعد"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingList rows={3} />
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="تقویم خالی است"
          description="بعد از ساخت برنامه و ارسال آن به ورزشکاران، جلسات تمرینی اینجا نمایش داده می‌شوند"
        />
      ) : (
        <div className="grid gap-3">
          {DAYS.map((day) => {
            const daySessions = weekSessions.filter((s) => s.dayLabel === day)
            if (daySessions.length === 0) return null
            return (
              <div key={day}>
                <h2 className="font-bold text-sm mb-2 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs">{day.slice(0, 2)}</span>
                  {day}
                </h2>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {daySessions.map((s) => {
                    const completed = s.logs.filter((l) => l.status === 'COMPLETED').length
                    return (
                      <Card key={s.id}>
                        <CardContent className="p-4 space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-bold text-sm truncate">{s.title}</p>
                              <p className="text-xs text-muted-foreground">{s.program.title}</p>
                            </div>
                            {s.focus && <Badge variant="secondary" className="shrink-0">{s.focus}</Badge>}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            {toFa(s.exercises.length)} حرکت
                            <span className="mx-1">•</span>
                            <Users className="w-3.5 h-3.5" />
                            {s.athletes.join('، ')}
                          </div>
                          {s.exercises.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {s.exercises.slice(0, 4).map((se, i) => (
                                <span key={i} className="text-[10px] bg-muted rounded-full px-2 py-0.5">{se.exercise.name}</span>
                              ))}
                              {s.exercises.length > 4 && (
                                <span className="text-[10px] text-muted-foreground px-1">+{toFa(s.exercises.length - 4)}</span>
                              )}
                            </div>
                          )}
                          {s.logs.length > 0 && (
                            <div className="text-[11px] text-muted-foreground border-t pt-2">
                              ثبت‌شده: {toFa(completed)} از {toFa(s.logs.length)} ورزشکار
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
