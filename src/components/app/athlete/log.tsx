'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useFetch, api, toFa } from '@/lib/client'
import { toast } from '@/hooks/use-toast'
import { EmptyState } from '@/components/app/shared/ui-bits'
import { PenLine, ClipboardList, Star, Timer, Trash2 } from 'lucide-react'

interface SessionItem {
  id: string
  title: string
  weekNumber: number
  dayNumber: number
  programTitle: string
  exercises: { id: string; name: string; sets: number; reps: string; weight?: string | null; exerciseId: string }[]
}

export function AthleteLogForm({ preselectedSessionId, onDone }: { preselectedSessionId?: string; onDone: () => void }) {
  const { data, loading } = useFetch<{ assignments: { program: { title: string; sessions: { id: string; title: string; weekNumber: number; dayNumber: number; exercises: { id: string; exercise: { id: string; name: string }; sets: number; reps: string; weight?: string | null }[] }[] } }[]; status: string }>(
    '/api/athlete/programs'
  )

  const sessions: SessionItem[] = useMemo(() => {
    const result: SessionItem[] = []
    for (const a of data?.assignments || []) {
      for (const s of a.program.sessions) {
        result.push({
          id: s.id,
          title: s.title,
          weekNumber: s.weekNumber,
          dayNumber: s.dayNumber,
          programTitle: a.program.title,
          exercises: s.exercises.map((se) => ({
            id: se.id,
            exerciseId: se.exercise.id,
            name: se.exercise.name,
            sets: se.sets,
            reps: se.reps,
            weight: se.weight,
          })),
        })
      }
    }
    return result
  }, [data])

  const [sessionId, setSessionId] = useState(preselectedSessionId || '')
  const [status, setStatus] = useState('COMPLETED')
  const [duration, setDuration] = useState('')
  const [rating, setRating] = useState('4')
  const [notes, setNotes] = useState('')
  const [logs, setLogs] = useState<Record<string, { sets: string; reps: string; weight: string }>>({})
  const [saving, setSaving] = useState(false)

  const currentSession = sessions.find((s) => s.id === sessionId)

  function setLog(exId: string, field: 'sets' | 'reps' | 'weight', value: string) {
    setLogs((l) => ({
      ...l,
      [exId]: { sets: '', reps: '', weight: '', ...l[exId], [field]: value },
    }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!sessionId) {
      toast({ title: 'جلسه را انتخاب کنید', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const exerciseLogs = currentSession
        ? currentSession.exercises
            .filter((ex) => logs[ex.id])
            .map((ex) => ({
              exerciseId: ex.exerciseId,
              exerciseName: ex.name,
              actualSets: logs[ex.id].sets || undefined,
              actualReps: logs[ex.id].reps || undefined,
              actualWeight: logs[ex.id].weight || undefined,
            }))
        : []
      await api('/api/athlete/logs', {
        method: 'POST',
        body: { sessionId, status, duration, rating, notes, exerciseLogs },
      })
      toast({ title: 'تمرین ثبت شد ✅', description: 'مربی‌ات نتایج را می‌بیند' })
      setLogs({})
      setNotes('')
      setDuration('')
      onDone()
    } catch (err) {
      toast({ title: 'خطا', description: err instanceof Error ? err.message : '', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6"><div className="h-64 rounded-xl bg-muted animate-pulse" /></div>

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl lg:text-2xl font-extrabold">ثبت نتایج تمرین</h1>
        <p className="text-sm text-muted-foreground mt-1">نتایج هر حرکت را همان‌طور که انجام دادی ثبت کن</p>
      </div>

      {sessions.length === 0 ? (
        <EmptyState icon={ClipboardList} title="جلسه‌ای برای ثبت وجود ندارد" description="اول باید مربی برایت برنامه ارسال کند" />
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-1.5">
                <Label>جلسه تمرینی *</Label>
                <Select value={sessionId} onValueChange={setSessionId} dir="rtl">
                  <SelectTrigger><SelectValue placeholder="انتخاب جلسه..." /></SelectTrigger>
                  <SelectContent>
                    {sessions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.programTitle} — هفته {toFa(s.weekNumber)} — {s.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>وضعیت</Label>
                  <Select value={status} onValueChange={setStatus} dir="rtl">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COMPLETED">کامل انجام دادم</SelectItem>
                      <SelectItem value="PARTIAL">ناقص</SelectItem>
                      <SelectItem value="SKIPPED">نتوانستم</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1"><Timer className="w-3 h-3" />مدت (دقیقه)</Label>
                  <Input dir="ltr" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1"><Star className="w-3 h-3" />کیفیت (از ۵)</Label>
                  <Select value={rating} onValueChange={setRating} dir="rtl">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['1', '2', '3', '4', '5'].map((r) => <SelectItem key={r} value={r}>{toFa(r)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {currentSession && currentSession.exercises.length > 0 && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <p className="font-bold text-sm">نتایج حرکات</p>
                {currentSession.exercises.map((ex, idx) => (
                  <div key={ex.id} className="rounded-xl border p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">
                        <span className="inline-flex w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 items-center justify-center text-xs font-bold ml-2">{toFa(idx + 1)}</span>
                        {ex.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">هدف: {toFa(ex.sets)}×{toFa(ex.reps)}{ex.weight ? ` × ${toFa(ex.weight)}kg` : ''}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-[11px] text-muted-foreground">ست انجام‌شده</Label>
                        <Input dir="ltr" type="number" value={logs[ex.id]?.sets || ''} onChange={(e) => setLog(ex.id, 'sets', e.target.value)} placeholder={String(ex.sets)} />
                      </div>
                      <div>
                        <Label className="text-[11px] text-muted-foreground">تکرار</Label>
                        <Input value={logs[ex.id]?.reps || ''} onChange={(e) => setLog(ex.id, 'reps', e.target.value)} placeholder={ex.reps} />
                      </div>
                      <div>
                        <Label className="text-[11px] text-muted-foreground">وزن (kg)</Label>
                        <Input dir="ltr" value={logs[ex.id]?.weight || ''} onChange={(e) => setLog(ex.id, 'weight', e.target.value)} placeholder={ex.weight || '-'} />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-4 space-y-1.5">
              <Label>یادداشت برای مربی</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="احساس کلی، درد یا مشکل، سوال..." />
            </CardContent>
          </Card>

          <Button type="submit" className="w-full h-11" disabled={saving}>
            <PenLine className="w-4 h-4 ml-1" />
            {saving ? 'در حال ثبت...' : 'ثبت تمرین'}
          </Button>
        </form>
      )}
    </div>
  )
}
