'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useFetch, api, LEVEL_LABEL, GOAL_LABEL, STATUS_LABEL } from '@/lib/client'
import { toast } from '@/hooks/use-toast'
import { LoadingList, EmptyState, StatusBadge } from '@/components/app/shared/ui-bits'
import {
  ClipboardList, Plus, Users, CalendarDays, Trash2, Pencil, Send,
  ListPlus, X, ArrowLeft,
} from 'lucide-react'

interface ProgramRow {
  id: string
  title: string
  description?: string | null
  goal?: string | null
  level?: string | null
  durationWeeks: number
  daysPerWeek: number
  status: string
  _count?: { sessions: number; assignments: number }
  assignments?: { athlete: { id: string; name: string } }[]
}

export function ProgramsView({ onOpenCalendar }: { onOpenCalendar: () => void }) {
  const { data, loading, refresh } = useFetch<{ programs: ProgramRow[] }>('/api/coach/programs')
  const [builderId, setBuilderId] = useState<string | null>(null)
  const [assignId, setAssignId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const programs = data?.programs || []

  if (builderId) {
    return <ProgramBuilder programId={builderId} onBack={() => { setBuilderId(null); refresh() }} onAssign={() => setAssignId(builderId)} />
  }

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold">برنامه‌های تمرینی</h1>
          <p className="text-sm text-muted-foreground mt-1">ساخت، ویرایش و ارسال برنامه برای ورزشکاران</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 ml-1" /> برنامه جدید</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <CreateProgramForm onDone={(id) => { setCreateOpen(false); refresh(); setBuilderId(id) }} />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <LoadingList rows={3} />
      ) : programs.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="هنوز برنامه‌ای نساخته‌اید"
          description="یک برنامه تمرینی بسازید، جلسات هفتگی و حرکات آن را تعریف کنید و برای یک یا چند ورزشکار ارسال کنید"
        />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {programs.map((p) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <button className="font-bold text-right hover:text-primary transition-colors" onClick={() => setBuilderId(p.id)}>
                      {p.title}
                    </button>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description || 'بدون توضیح'}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {p.level && <Badge variant="secondary">{LEVEL_LABEL[p.level] || p.level}</Badge>}
                  {p.goal && <Badge variant="secondary">{GOAL_LABEL[p.goal] || p.goal}</Badge>}
                  <Badge variant="secondary">{toFa(p.durationWeeks)} هفته</Badge>
                  <Badge variant="secondary">{toFa(p._count?.sessions || 0)} جلسه</Badge>
                </div>
                <div className="flex items-center justify-between pt-1 border-t">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    {(p.assignments || []).length > 0
                      ? p.assignments!.map((a) => a.athlete.name).join('، ')
                      : 'برای هیچ ورزشکاری ارسال نشده'}
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-8" onClick={() => setAssignId(p.id)}>
                      <Send className="w-3.5 h-3.5 ml-1" /> ارسال
                    </Button>
                    <Button size="sm" variant="outline" className="h-8" onClick={() => setBuilderId(p.id)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {assignId && (
        <AssignDialog
          programId={assignId}
          onClose={() => setAssignId(null)}
          onDone={() => { setAssignId(null); refresh() }}
        />
      )}
    </div>
  )
}

function toFa(n: number | string): string {
  return String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)])
}

function CreateProgramForm({ onDone }: { onDone: (id: string) => void }) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', goal: 'FITNESS', level: 'BEGINNER', durationWeeks: '4', daysPerWeek: '3' })
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api<{ program: { id: string } }>('/api/coach/programs', { method: 'POST', body: form })
      toast({ title: 'برنامه ساخته شد', description: 'حالا جلسات و حرکات را اضافه کنید' })
      onDone(res.program.id)
    } catch (err) {
      toast({ title: 'خطا', description: err instanceof Error ? err.message : '', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>ساخت برنامه تمرینی جدید</DialogTitle>
        <DialogDescription>اطلاعات کلی برنامه را وارد کنید؛ در مرحله بعد جلسات و حرکات را اضافه می‌کنید</DialogDescription>
      </DialogHeader>
      <div className="space-y-1.5">
        <Label>عنوان برنامه *</Label>
        <Input value={form.title} onChange={(e) => set('title', e.target.value)} required placeholder="مثلاً: برنامه افزایش عضله ۴ هفته‌ای" />
      </div>
      <div className="space-y-1.5">
        <Label>توضیحات</Label>
        <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={2} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>هدف</Label>
          <Select value={form.goal} onValueChange={(v) => set('goal', v)} dir="rtl">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(GOAL_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>سطح</Label>
          <Select value={form.level} onValueChange={(v) => set('level', v)} dir="rtl">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(LEVEL_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>مدت (هفته)</Label>
          <Input dir="ltr" type="number" min="1" max="52" value={form.durationWeeks} onChange={(e) => set('durationWeeks', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>روز در هفته</Label>
          <Input dir="ltr" type="number" min="1" max="7" value={form.daysPerWeek} onChange={(e) => set('daysPerWeek', e.target.value)} />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={saving}>{saving ? 'در حال ساخت...' : 'ساخت برنامه'}</Button>
    </form>
  )
}

// ---------- Assign dialog ----------
function AssignDialog({ programId, onClose, onDone }: { programId: string; onClose: () => void; onDone: () => void }) {
  const { data } = useFetch<{ athletes: { id: string; name: string; email: string }[] }>('/api/coach/athletes')
  const [selected, setSelected] = useState<string[]>([])
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [saving, setSaving] = useState(false)

  async function submit() {
    if (selected.length === 0) {
      toast({ title: 'حداقل یک ورزشکار انتخاب کنید', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const res = await api<{ assigned: number }>(`/api/coach/programs/${programId}/assign`, {
        method: 'POST',
        body: { athleteIds: selected, startDate },
      })
      toast({ title: 'برنامه ارسال شد', description: `برنامه برای ${toFa(res.assigned)} ورزشکار فعال شد` })
      onDone()
    } catch (e) {
      toast({ title: 'خطا', description: e instanceof Error ? e.message : '', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>ارسال برنامه برای ورزشکاران</DialogTitle>
          <DialogDescription>یک یا چند ورزشکار را انتخاب کنید</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {(data?.athletes || []).map((a) => (
            <label
              key={a.id}
              className="flex items-center gap-3 rounded-xl border p-3 cursor-pointer hover:bg-accent/50 transition-colors"
            >
              <input
                type="checkbox"
                className="w-4 h-4 accent-emerald-600"
                checked={selected.includes(a.id)}
                onChange={(e) => setSelected((s) => (e.target.checked ? [...s, a.id] : s.filter((x) => x !== a.id)))}
              />
              <div>
                <p className="font-semibold text-sm">{a.name}</p>
                <p className="text-xs text-muted-foreground">{a.email}</p>
              </div>
            </label>
          ))}
          {data && data.athletes.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">اول از بخش «ورزشکاران» ورزشکار اضافه کنید</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>تاریخ شروع</Label>
          <Input dir="ltr" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <Button className="w-full" onClick={submit} disabled={saving}>
          <Send className="w-4 h-4 ml-1" /> ارسال برنامه ({toFa(selected.length)} ورزشکار)
        </Button>
      </DialogContent>
    </Dialog>
  )
}

// ---------- Program Builder ----------
interface SessionExercise {
  id: string
  exercise: { id: string; name: string; category: string }
  sets: number
  reps: string
  weight?: string | null
  restSeconds: number
}

interface ProgramSession {
  id: string
  title: string
  weekNumber: number
  dayNumber: number
  dayLabel?: string | null
  focus?: string | null
  exercises: SessionExercise[]
}

function ProgramBuilder({ programId, onBack, onAssign }: { programId: string; onBack: () => void; onAssign: () => void }) {
  const { data, loading, refresh } = useFetch<{ program: ProgramRow & { sessions: ProgramSession[] } }>(
    `/api/coach/programs/${programId}`
  )
  const [addSessionOpen, setAddSessionOpen] = useState(false)

  const program = data?.program

  async function deleteSession(sessionId: string) {
    if (!confirm('این جلسه حذف شود؟')) return
    try {
      await api(`/api/coach/programs/${programId}/sessions/${sessionId}`, { method: 'DELETE' })
      toast({ title: 'جلسه حذف شد' })
      refresh()
    } catch (e) {
      toast({ title: 'خطا', description: e instanceof Error ? e.message : '', variant: 'destructive' })
    }
  }

  async function removeExercise(seId: string) {
    try {
      await api(`/api/coach/session-exercises/${seId}`, { method: 'DELETE' })
      refresh()
    } catch (e) {
      toast({ title: 'خطا', description: e instanceof Error ? e.message : '', variant: 'destructive' })
    }
  }

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={onBack} aria-label="برگشت">
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Button>
          <div>
            <h1 className="text-lg lg:text-xl font-extrabold">{program?.title || 'برنامه'}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {program && `${toFa(program.durationWeeks)} هفته — ${toFa(program.sessions.length)} جلسه`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onAssign}><Send className="w-4 h-4 ml-1" /> ارسال به ورزشکار</Button>
          <Button onClick={() => setAddSessionOpen(true)}><Plus className="w-4 h-4 ml-1" /> جلسه جدید</Button>
        </div>
      </div>

      {loading ? (
        <LoadingList rows={3} />
      ) : !program || program.sessions.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="هنوز جلسه‌ای ندارید"
          description="برای هر روز تمرینی یک جلسه بسازید و حرکات آن را از بانک حرکات اضافه کنید"
        />
      ) : (
        <Accordion type="multiple" defaultValue={program.sessions.slice(0, 2).map((s) => s.id)}>
          {program.sessions.map((s) => (
            <AccordionItem key={s.id} value={s.id} className="border rounded-xl mb-3 px-4 bg-card">
              <div className="flex items-center gap-2">
                <AccordionTrigger className="flex-1 hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-right flex-1">
                    <Badge className="bg-emerald-100 text-emerald-800 border-transparent shrink-0">هفته {toFa(s.weekNumber)}</Badge>
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{s.title}</p>
                      {s.focus && <p className="text-xs text-muted-foreground">{s.focus}</p>}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{toFa(s.exercises.length)} حرکت</span>
                  </div>
                </AccordionTrigger>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-600 shrink-0" onClick={() => deleteSession(s.id)} aria-label="حذف جلسه">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <AccordionContent className="pb-4">
                {s.exercises.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">هنوز حرکتی اضافه نشده — از فرم پایین اضافه کنید</p>
                ) : (
                  <div className="space-y-2 mb-3">
                    {s.exercises.map((se, idx) => (
                      <div key={se.id} className="flex items-center gap-3 rounded-lg border bg-background p-2.5">
                        <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">{toFa(idx + 1)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{se.exercise.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {toFa(se.sets)} ست × {toFa(se.reps)} تکرار{se.weight ? ` × ${toFa(se.weight)} کیلو` : ''} — استراحت {toFa(se.restSeconds)} ثانیه
                          </p>
                        </div>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-600 shrink-0" onClick={() => removeExercise(se.id)} aria-label="حذف حرکت">
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <AddExerciseToSession programId={programId} sessionId={s.id} onDone={refresh} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <Dialog open={addSessionOpen} onOpenChange={setAddSessionOpen}>
        <DialogContent className="max-w-md">
          <AddSessionForm programId={programId} onDone={() => { setAddSessionOpen(false); refresh() }} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AddSessionForm({ programId, onDone }: { programId: string; onDone: () => void }) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', weekNumber: '1', dayNumber: '1', dayLabel: 'شنبه', focus: '' })
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))
  const DAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه']

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api(`/api/coach/programs/${programId}/sessions`, { method: 'POST', body: form })
      toast({ title: 'جلسه اضافه شد' })
      onDone()
    } catch (err) {
      toast({ title: 'خطا', description: err instanceof Error ? err.message : '', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>جلسه تمرینی جدید</DialogTitle>
        <DialogDescription>هفته و روز جلسه را مشخص کنید</DialogDescription>
      </DialogHeader>
      <div className="space-y-1.5">
        <Label>عنوان جلسه *</Label>
        <Input value={form.title} onChange={(e) => set('title', e.target.value)} required placeholder="مثلاً: سینه و پشت بازو" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>هفته</Label>
          <Input dir="ltr" type="number" min="1" value={form.weekNumber} onChange={(e) => set('weekNumber', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>روز جلسه</Label>
          <Select value={form.dayLabel} onValueChange={(v) => set('dayLabel', v)} dir="rtl">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>تمرکز (اختیاری)</Label>
          <Input value={form.focus} onChange={(e) => set('focus', e.target.value)} placeholder="بالاتنه، پا و مرکزی بدن..." />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={saving}>{saving ? '...' : 'افزودن جلسه'}</Button>
    </form>
  )
}

function AddExerciseToSession({ programId, sessionId, onDone }: { programId: string; sessionId: string; onDone: () => void }) {
  const { data } = useFetch<{ exercises: { id: string; name: string; category: string }[] }>('/api/coach/exercises')
  const [exerciseId, setExerciseId] = useState('')
  const [sets, setSets] = useState('3')
  const [reps, setReps] = useState('10')
  const [weight, setWeight] = useState('')
  const [rest, setRest] = useState('60')
  const [saving, setSaving] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!exerciseId) {
      toast({ title: 'ابتدا حرکت را انتخاب کنید', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      await api(`/api/coach/programs/${programId}/sessions/${sessionId}/exercises`, {
        method: 'POST',
        body: { exerciseId, sets, reps, weight, restSeconds: rest },
      })
      toast({ title: 'حرکت اضافه شد' })
      setExerciseId('')
      onDone()
    } catch (err) {
      toast({ title: 'خطا', description: err instanceof Error ? err.message : '', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="rounded-xl border bg-muted/40 p-3 space-y-2.5">
      <p className="text-xs font-bold text-muted-foreground">افزودن حرکت به این جلسه</p>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <div className="col-span-2">
          <Select value={exerciseId} onValueChange={setExerciseId} dir="rtl">
            <SelectTrigger><SelectValue placeholder="انتخاب حرکت..." /></SelectTrigger>
            <SelectContent className="max-h-60">
              {(data?.exercises || []).map((ex) => (
                <SelectItem key={ex.id} value={ex.id}>{ex.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Input dir="ltr" type="number" min="1" value={sets} onChange={(e) => setSets(e.target.value)} placeholder="ست" />
        <Input value={reps} onChange={(e) => setReps(e.target.value)} placeholder="تکرار" />
        <Input dir="ltr" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="وزن (kg)" />
      </div>
      <div className="flex gap-2">
        <Input dir="ltr" type="number" value={rest} onChange={(e) => setRest(e.target.value)} placeholder="استراحت (ثانیه)" className="w-40" />
        <Button type="submit" size="sm" disabled={saving} className="mr-auto">
          <ListPlus className="w-4 h-4 ml-1" /> افزودن
        </Button>
      </div>
    </form>
  )
}
