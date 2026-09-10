'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useFetch, toFa, faDateShort, faDayName, faTime } from '@/lib/client'
import { LoadingList, EmptyState, StatusBadge } from '@/components/app/shared/ui-bits'
import { History, Timer, Star } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

interface LogRow {
  id: string
  title?: string | null
  date: string
  status: string
  duration?: number | null
  rating?: number | null
  notes?: string | null
  session?: { title: string; weekNumber?: number; dayNumber?: number; program?: { title: string } } | null
  exerciseLogs: { id: string; exerciseName: string; actualSets?: number | null; actualReps?: string | null; actualWeight?: string | null }[]
}

export function AthleteHistory() {
  const { data, loading } = useFetch<{ logs: LogRow[] }>('/api/athlete/logs')

  if (loading) return <div className="p-6"><LoadingList rows={4} /></div>
  const logs = data?.logs || []

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl lg:text-2xl font-extrabold">سوابق تمرینی</h1>
        <p className="text-sm text-muted-foreground mt-1">تمام تمرین‌های ثبت‌شده شما</p>
      </div>

      {logs.length === 0 ? (
        <EmptyState icon={History} title="هنوز تمرینی ثبت نشده" description="بعد از اولین تمرین، سوابق اینجا نمایش داده می‌شود" />
      ) : (
        <Accordion type="single" collapsible>
          {logs.map((log) => (
            <AccordionItem key={log.id} value={log.id} className="border rounded-xl bg-card px-4 mb-2.5">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex flex-wrap items-center gap-2.5 text-right flex-1">
                  <StatusBadge status={log.status} />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm truncate">{log.session?.title || log.title || 'تمرین'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {log.session?.program?.title ? `${log.session.program.title} — ` : ''}
                      {faDayName(log.date)} {faDateShort(log.date)} — {faTime(log.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                    {log.duration && <span className="flex items-center gap-1"><Timer className="w-3.5 h-3.5" />{toFa(log.duration)} دقیقه</span>}
                    {log.rating && <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500" />{toFa(log.rating)}</span>}
                    <Badge variant="secondary">{toFa(log.exerciseLogs.length)} حرکت</Badge>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                {log.exerciseLogs.length > 0 ? (
                  <div className="space-y-2">
                    {log.exerciseLogs.map((el) => (
                      <div key={el.id} className="flex items-center justify-between rounded-lg border bg-background p-2.5 text-sm">
                        <span className="font-medium">{el.exerciseName}</span>
                        <span className="text-xs text-muted-foreground">
                          {el.actualSets ? `${toFa(el.actualSets)} ست` : '-'}
                          {el.actualReps ? ` × ${toFa(el.actualReps)} تکرار` : ''}
                          {el.actualWeight ? ` × ${toFa(el.actualWeight)}kg` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">جزئیات حرکات ثبت نشده</p>
                )}
                {log.notes && (
                  <div className="mt-3 rounded-lg bg-muted p-3 text-sm">
                    <span className="font-semibold">یادداشت: </span>{log.notes}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  )
}
