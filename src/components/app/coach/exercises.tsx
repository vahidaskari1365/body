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
import { useFetch, api, CATEGORY_LABEL } from '@/lib/client'
import { toast } from '@/hooks/use-toast'
import { LoadingList, EmptyState, VideoPlayer, VideoDialog } from '@/components/app/shared/ui-bits'
import { Dumbbell, Plus, Search, PlayCircle, Pencil, Trash2 } from 'lucide-react'

interface Exercise {
  id: string
  name: string
  category: string
  muscleGroups?: string | null
  equipment?: string | null
  description?: string | null
  instructions?: string | null
  videoUrl?: string | null
  _count?: { sessionExercises: number }
}

const CATEGORIES = Object.keys(CATEGORY_LABEL)

export function ExercisesView() {
  const { data, loading, refresh } = useFetch<{ exercises: Exercise[] }>('/api/coach/exercises')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('ALL')
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<Exercise | null>(null)
  const [videoWatch, setVideoWatch] = useState<{ url: string; title: string } | null>(null)

  const exercises = (data?.exercises || []).filter(
    (e) =>
      (category === 'ALL' || e.category === category) &&
      (!search || e.name.includes(search) || (e.muscleGroups || '').includes(search))
  )

  async function remove(ex: Exercise) {
    if (!confirm(`حرکت «${ex.name}» حذف شود؟ از تمام برنامه‌ها هم برداشته می‌شود.`)) return
    try {
      await api(`/api/coach/exercises/${ex.id}`, { method: 'DELETE' })
      toast({ title: 'حرکت حذف شد' })
      refresh()
    } catch (e) {
      toast({ title: 'خطا', description: e instanceof Error ? e.message : '', variant: 'destructive' })
    }
  }

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold">بانک حرکات ورزشی</h1>
          <p className="text-sm text-muted-foreground mt-1">حرکات با ویدئوی آموزشی — پایه ساخت برنامه‌های تمرینی</p>
        </div>
        <Dialog open={formOpen} onOpenChange={(v) => { setFormOpen(v); if (!v) setEditItem(null) }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 ml-1" /> حرکت جدید</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <ExerciseForm
              editItem={editItem}
              onDone={() => {
                setFormOpen(false)
                setEditItem(null)
                refresh()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="جستجوی حرکت یا گروه عضلانی..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-9" />
        </div>
        <Select value={category} onValueChange={setCategory} dir="rtl">
          <SelectTrigger className="sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">همه دسته‌ها</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{CATEGORY_LABEL[c]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <LoadingList rows={3} />
      ) : exercises.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title={search || category !== 'ALL' ? 'حرکتی یافت نشد' : 'بانک حرکات خالی است'}
          description="اولین حرکت را با ویدئوی آموزشی اضافه کنید؛ بعد از آن می‌توانید در برنامه‌های تمرینی از آن استفاده کنید"
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {exercises.map((ex) => (
            <Card key={ex.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <VideoPlayer url={ex.videoUrl} title={ex.name} className="rounded-none border-b" />
                {ex.videoUrl && (
                  <button
                    className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors group"
                    onClick={() => setVideoWatch({ url: ex.videoUrl!, title: ex.name })}
                    aria-label="پخش ویدئو"
                  >
                    <PlayCircle className="w-12 h-12 text-white/90 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                  </button>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold truncate">{ex.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{ex.muscleGroups || '—'}</p>
                  </div>
                  <Badge variant="secondary">{CATEGORY_LABEL[ex.category] || ex.category}</Badge>
                </div>
                {ex.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{ex.description}</p>}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[11px] text-muted-foreground">
                    {ex.equipment ? `تجهیزات: ${ex.equipment}` : ''}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      size="icon" variant="ghost" className="h-8 w-8"
                      onClick={() => { setEditItem(ex); setFormOpen(true) }}
                      aria-label="ویرایش"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-600" onClick={() => remove(ex)} aria-label="حذف">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {videoWatch && <VideoDialog url={videoWatch.url} title={videoWatch.title} onClose={() => setVideoWatch(null)} />}
    </div>
  )
}

function ExerciseForm({ editItem, onDone }: { editItem: Exercise | null; onDone: () => void }) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: editItem?.name || '',
    category: editItem?.category || 'STRENGTH',
    muscleGroups: editItem?.muscleGroups || '',
    equipment: editItem?.equipment || '',
    description: editItem?.description || '',
    instructions: editItem?.instructions || '',
    videoUrl: editItem?.videoUrl || '',
  })
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editItem) {
        await api(`/api/coach/exercises/${editItem.id}`, { method: 'PATCH', body: form })
        toast({ title: 'حرکت ویرایش شد' })
      } else {
        await api('/api/coach/exercises', { method: 'POST', body: form })
        toast({ title: 'حرکت جدید ثبت شد' })
      }
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
        <DialogTitle>{editItem ? 'ویرایش حرکت' : 'افزودن حرکت جدید'}</DialogTitle>
        <DialogDescription>لینک ویدئو می‌تواند از آپارات، یوتیوب یا فایل mp4 باشد</DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1.5">
          <Label>نام حرکت *</Label>
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="مثلاً: اسکوات با هالتر" />
        </div>
        <div className="space-y-1.5">
          <Label>دسته‌بندی *</Label>
          <Select value={form.category} onValueChange={(v) => set('category', v)} dir="rtl">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{CATEGORY_LABEL[c]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>گروه عضلانی</Label>
          <Input value={form.muscleGroups} onChange={(e) => set('muscleGroups', e.target.value)} placeholder="سینه، سرشانه..." />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>تجهیزات لازم</Label>
          <Input value={form.equipment} onChange={(e) => set('equipment', e.target.value)} placeholder="هالتر، دمبل، کش..." />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>توضیح کوتاه</Label>
          <Input value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>نکات اجرا (فرم صحیح)</Label>
          <Textarea value={form.instructions} onChange={(e) => set('instructions', e.target.value)} rows={3} placeholder="مرحله‌به‌مرحله اجرای صحیح حرکت..." />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>لینک ویدئوی آموزشی</Label>
          <Input dir="ltr" value={form.videoUrl} onChange={(e) => set('videoUrl', e.target.value)} placeholder="https://www.aparat.com/v/... یا https://youtube.com/watch?v=... یا .mp4" />
        </div>
      </div>
      {form.videoUrl && (
        <div>
          <Label className="mb-2 block">پیش‌نمایش ویدئو</Label>
          <VideoPlayer url={form.videoUrl} />
        </div>
      )}
      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? 'در حال ذخیره...' : editItem ? 'ذخیره تغییرات' : 'ثبت حرکت'}
      </Button>
    </form>
  )
}
