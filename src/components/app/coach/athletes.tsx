'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useFetch, api, toFa, faMoney, LEVEL_LABEL, GOAL_LABEL } from '@/lib/client'
import { toast } from '@/hooks/use-toast'
import { LoadingList, EmptyState, StatusBadge } from '@/components/app/shared/ui-bits'
import { Users, Plus, Search, Phone, Mail, Ruler, Weight as WeightIcon, Target, Trash2, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface AthleteRow {
  id: string
  name: string
  email: string
  phone?: string | null
  profile?: {
    height?: number | null
    weight?: number | null
    sport?: string | null
    goal?: string | null
    level?: string | null
    status?: string
    medicalNotes?: string | null
  } | null
  activePrograms: { id: string; title: string }[]
  latestWeight?: number | null
  adherence?: number | null
}

interface AthleteDetail {
  athlete: AthleteRow & {
    workoutLogs: { id: string; status: string; date: string; title?: string | null; session?: { title: string } | null }[]
    progressEntries: { id: string; date: string; weight?: number | null; bodyFat?: number | null }[]
    paymentsReceived: { id: string; amount: number; title: string; status: string; date: string }[]
  }
}

export function AthletesView() {
  const { data, loading, refresh } = useFetch<{ athletes: AthleteRow[] }>('/api/coach/athletes')
  const [addOpen, setAddOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const athletes = (data?.athletes || []).filter(
    (a) => a.name.includes(search) || a.email.includes(search.toLowerCase())
  )

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold">ورزشکاران من</h1>
          <p className="text-sm text-muted-foreground mt-1">مدیریت پروفایل و وضعیت ورزشکاران</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 ml-1" /> افزودن ورزشکار
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <AddAthleteForm
              onDone={() => {
                setAddOpen(false)
                refresh()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="جستجوی نام یا ایمیل..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-9" />
      </div>

      {loading ? (
        <LoadingList rows={3} />
      ) : athletes.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? 'نتیجه‌ای یافت نشد' : 'هنوز ورزشکاری ندارید'}
          description="با دکمه «افزودن ورزشکار» اولین ورزشکار خود را ثبت کنید تا بتوانید برنامه تمرینی برایش بسازید"
        />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {athletes.map((a) => (
            <Card key={a.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setDetailId(a.id)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-emerald-100 text-emerald-800 font-bold text-lg">{a.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold truncate">{a.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{a.profile?.sport || 'ورزشکار'}</p>
                  </div>
                  {a.profile?.status && <StatusBadge status={a.profile.status} />}
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="rounded-lg bg-muted/70 py-2">
                    <p className="text-[10px] text-muted-foreground">وزن (kg)</p>
                    <p className="font-bold text-sm mt-0.5">{a.latestWeight ? toFa(a.latestWeight) : '-'}</p>
                  </div>
                  <div className="rounded-lg bg-muted/70 py-2">
                    <p className="text-[10px] text-muted-foreground">تبعیت</p>
                    <p className="font-bold text-sm mt-0.5">{a.adherence !== null && a.adherence !== undefined ? `${toFa(a.adherence)}٪` : '-'}</p>
                  </div>
                  <div className="rounded-lg bg-muted/70 py-2">
                    <p className="text-[10px] text-muted-foreground">برنامه فعال</p>
                    <p className="font-bold text-sm mt-0.5">{toFa(a.activePrograms.length)}</p>
                  </div>
                </div>
                {a.activePrograms.length > 0 && (
                  <p className="text-[11px] text-muted-foreground mt-3 truncate">برنامه: {a.activePrograms.map((p) => p.title).join('، ')}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={!!detailId} onOpenChange={(open) => !open && setDetailId(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0" side="left">
          {detailId && <AthleteDetailContent id={detailId} />}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function AddAthleteForm({ onDone }: { onDone: () => void }) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', height: '', weight: '',
    sport: '', goal: '', level: 'BEGINNER', birthDate: '', medicalNotes: '',
  })
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api('/api/coach/athletes', { method: 'POST', body: form })
      toast({ title: 'ورزشکار اضافه شد', description: `${form.name} با موفقیت ثبت شد` })
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
        <DialogTitle>افزودن ورزشکار جدید</DialogTitle>
        <DialogDescription>حساب ورزشکار ساخته می‌شود و می‌توانید برنامه تمرینی برایش ارسال کنید</DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1.5">
          <Label>نام و نام خانوادگی *</Label>
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>ایمیل *</Label>
          <Input dir="ltr" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>رمز عبور موقت *</Label>
          <Input dir="ltr" value={form.password} onChange={(e) => set('password', e.target.value)} required minLength={6} />
        </div>
        <div className="space-y-1.5">
          <Label>موبایل</Label>
          <Input dir="ltr" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>رشته ورزشی</Label>
          <Input value={form.sport} onChange={(e) => set('sport', e.target.value)} placeholder="فیتنس، بوکس..." />
        </div>
        <div className="space-y-1.5">
          <Label>قد (سانتی‌متر)</Label>
          <Input dir="ltr" type="number" value={form.height} onChange={(e) => set('height', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>وزن (کیلوگرم)</Label>
          <Input dir="ltr" type="number" value={form.weight} onChange={(e) => set('weight', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>سطح</Label>
          <Select value={form.level} onValueChange={(v) => set('level', v)} dir="rtl">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="BEGINNER">مبتدی</SelectItem>
              <SelectItem value="INTERMEDIATE">متوسط</SelectItem>
              <SelectItem value="ADVANCED">پیشرفته</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>هدف تمرینی</Label>
          <Select value={form.goal} onValueChange={(v) => set('goal', v)} dir="rtl">
            <SelectTrigger><SelectValue placeholder="انتخاب کنید" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="MUSCLE_GAIN">افزایش عضله</SelectItem>
              <SelectItem value="FAT_LOSS">کاهش وزن</SelectItem>
              <SelectItem value="FITNESS">تناسب اندام</SelectItem>
              <SelectItem value="ATHLETIC">آمادگی مسابقه</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>نکات پزشکی / محدودیت‌ها</Label>
          <Textarea value={form.medicalNotes} onChange={(e) => set('medicalNotes', e.target.value)} placeholder="آسیب‌دیدگی، بیماری، محدودیت حرکتی..." />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? 'در حال ذخیره...' : 'ثبت ورزشکار'}
      </Button>
    </form>
  )
}

function AthleteDetailContent({ id }: { id: string }) {
  const { data, loading, refresh } = useFetch<AthleteDetail>(`/api/coach/athletes/${id}`)
  const [weightOpen, setWeightOpen] = useState(false)

  if (loading || !data) {
    return <div className="p-6 space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
  }

  const a = data.athlete
  const weightData = a.progressEntries.filter((p) => p.weight).map((p) => ({
    date: new Intl.DateTimeFormat('fa-IR-u-ca-persian', { month: 'short', day: 'numeric' }).format(new Date(p.date)),
    weight: p.weight,
  }))

  return (
    <div className="p-5 space-y-5">
      <SheetHeader className="p-0">
        <div className="flex items-center gap-3">
          <Avatar className="w-14 h-14">
            <AvatarFallback className="bg-emerald-100 text-emerald-800 font-bold text-xl">{a.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <SheetTitle>{a.name}</SheetTitle>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
              <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{a.email}</span>
              {a.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{toFa(a.phone)}</span>}
            </div>
          </div>
        </div>
      </SheetHeader>

      {/* info grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { label: 'قد', value: a.profile?.height ? `${toFa(a.profile.height)} سانتی‌متر` : '-', icon: Ruler },
          { label: 'وزن فعلی', value: a.latestWeight ? `${toFa(a.latestWeight)} کیلوگرم` : '-', icon: WeightIcon },
          { label: 'هدف', value: a.profile?.goal ? GOAL_LABEL[a.profile.goal] || a.profile.goal : '-', icon: Target },
          { label: 'سطح', value: a.profile?.level ? LEVEL_LABEL[a.profile.level] || a.profile.level : '-', icon: TrendingUp },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border p-3">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1"><item.icon className="w-3.5 h-3.5" />{item.label}</p>
            <p className="font-bold text-sm mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      {a.profile?.medicalNotes && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-sm text-amber-900">
          <span className="font-bold">نکات پزشکی: </span>{a.profile.medicalNotes}
        </div>
      )}

      {/* active programs */}
      <section>
        <h3 className="font-bold text-sm mb-2.5">برنامه‌های فعال</h3>
        {a.activePrograms?.length ? (
          <div className="flex flex-wrap gap-2">
            {a.activePrograms.map((p) => (
              <span key={p.id} className="text-xs bg-emerald-100 text-emerald-800 rounded-full px-3 py-1.5 font-medium">{p.title}</span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">برنامه فعالی ندارد</p>
        )}
      </section>

      {/* weight chart */}
      <section>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="font-bold text-sm">روند وزن</h3>
          <Button size="sm" variant="outline" onClick={() => setWeightOpen(true)}>ثبت وزن جدید</Button>
        </div>
        {weightData.length >= 2 ? (
          <div className="h-48 rounded-xl border p-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="date" fontSize={11} tickLine={false} />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} fontSize={11} tickLine={false} width={35} />
                <Tooltip formatter={(v) => [`${toFa(v as number)} kg`, 'وزن']} />
                <Line type="monotone" dataKey="weight" stroke="#059669" strokeWidth={2.5} dot={{ r: 4, fill: '#059669' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">برای نمایش نمودار حداقل دو وزن ثبت کنید</p>
        )}
      </section>

      {/* logs */}
      <section>
        <h3 className="font-bold text-sm mb-2.5">آخرین تمرین‌ها</h3>
        <div className="space-y-2">
          {a.workoutLogs.slice(0, 8).map((log) => (
            <div key={log.id} className="flex items-center justify-between rounded-xl border p-3 text-sm">
              <span>{log.session?.title || log.title || 'تمرین'}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{new Intl.DateTimeFormat('fa-IR-u-ca-persian', { month: 'short', day: 'numeric' }).format(new Date(log.date))}</span>
                <StatusBadge status={log.status} />
              </div>
            </div>
          ))}
          {a.workoutLogs.length === 0 && <p className="text-sm text-muted-foreground">تمرینی ثبت نشده است</p>}
        </div>
      </section>

      {/* payments */}
      <section>
        <h3 className="font-bold text-sm mb-2.5">مالی</h3>
        {a.paymentsReceived.length ? (
          <div className="space-y-2">
            {a.paymentsReceived.slice(0, 6).map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl border p-3 text-sm">
                <span>{p.title}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{faMoney(p.amount)}</span>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">پرداختی ثبت نشده است</p>
        )}
      </section>

      <WeightDialog open={weightOpen} onOpenChange={setWeightOpen} athleteId={id} onDone={refresh} />
    </div>
  )
}

function WeightDialog({ open, onOpenChange, athleteId, onDone }: { open: boolean; onOpenChange: (v: boolean) => void; athleteId: string; onDone: () => void }) {
  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      // coach records progress for athlete via athlete progress endpoint? -> dedicated: use athlete endpoint is for athlete; here we reuse PATCH profile weight AND create progress entry through athlete detail PATCH
      await api(`/api/coach/athletes/${athleteId}`, { method: 'PATCH', body: { weight } })
      toast({ title: 'وزن به‌روزرسانی شد' })
      onOpenChange(false)
      onDone()
    } catch (err) {
      toast({ title: 'خطا', description: err instanceof Error ? err.message : '', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>ثبت وزن جدید</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label>وزن (کیلوگرم) *</Label>
            <Input dir="ltr" type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>درصد چربی (اختیاری)</Label>
            <Input dir="ltr" type="number" step="0.1" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={saving}>ذخیره</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
