'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFetch, api, toFa, faDateShort } from '@/lib/client'
import { toast } from '@/hooks/use-toast'
import { LoadingList, EmptyState } from '@/components/app/shared/ui-bits'
import { Plus, Scale, Flame, Activity } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

interface Entry {
  id: string
  date: string
  weight?: number | null
  bodyFat?: number | null
  muscleMass?: number | null
  notes?: string | null
}

export function AthleteProgress() {
  const { data, loading, refresh } = useFetch<{ entries: Entry[] }>('/api/athlete/progress')
  const [open, setOpen] = useState(false)

  const entries = data?.entries || []
  const chartData = entries
    .filter((e) => e.weight)
    .map((e) => ({
      date: new Intl.DateTimeFormat('fa-IR-u-ca-persian', { month: 'short', day: 'numeric' }).format(new Date(e.date)),
      weight: e.weight,
      bodyFat: e.bodyFat,
    }))

  const first = entries.find((e) => e.weight)
  const last = [...entries].reverse().find((e) => e.weight)
  const change = first && last && first.weight && last.weight ? Math.round((last.weight - first.weight) * 10) / 10 : null

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold">روند پیشرفت</h1>
          <p className="text-sm text-muted-foreground mt-1">ثبت و بررسی وزن و ترکیب بدنی</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 ml-1" /> ثبت اندازه‌گیری</Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <MeasurementForm onDone={() => { setOpen(false); refresh() }} />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <LoadingList rows={2} />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Scale}
          title="هنوز اندازه‌گیری ثبت نکرده‌ای"
          description="وزن خود را هفتگی ثبت کن تا روند پیشرفتت را ببینی و مربی‌ات برنامه را تنظیم کند"
        />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <Scale className="w-5 h-5 mx-auto text-primary mb-1.5" />
                <p className="text-xs text-muted-foreground">وزن فعلی</p>
                <p className="text-xl font-extrabold mt-1">{last?.weight ? `${toFa(last.weight)}` : '-'} <span className="text-xs font-normal">kg</span></p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Activity className="w-5 h-5 mx-auto text-amber-600 mb-1.5" />
                <p className="text-xs text-muted-foreground">تغییر وزن</p>
                <p className={`text-xl font-extrabold mt-1 ${change && change < 0 ? 'text-emerald-600' : change && change > 0 ? 'text-amber-600' : ''}`}>
                  {change !== null ? (change > 0 ? '+' : '') + toFa(change) : '-'} <span className="text-xs font-normal">kg</span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Flame className="w-5 h-5 mx-auto text-rose-500 mb-1.5" />
                <p className="text-xs text-muted-foreground">تعداد ثبت</p>
                <p className="text-xl font-extrabold mt-1">{toFa(entries.length)}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-4">
              <h2 className="font-bold text-sm mb-3">نمودار وزن و چربی</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="date" fontSize={10} tickLine={false} />
                    <YAxis fontSize={11} tickLine={false} width={35} />
                    <Tooltip formatter={(v, name) => [`${toFa(v as number)} ${name === 'weight' ? 'kg' : '٪'}`, name === 'weight' ? 'وزن' : 'چربی']} />
                    <Legend formatter={(v) => (v === 'weight' ? 'وزن (kg)' : 'درصد چربی')} />
                    <Line type="monotone" dataKey="weight" stroke="#059669" strokeWidth={2.5} dot={{ r: 4, fill: '#059669' }} />
                    <Line type="monotone" dataKey="bodyFat" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="font-bold text-sm mb-3">تاریخچه اندازه‌گیری</h2>
              <div className="space-y-2">
                {[...entries].reverse().map((e) => (
                  <div key={e.id} className="flex items-center justify-between rounded-xl border p-3 text-sm">
                    <span className="text-muted-foreground">{faDateShort(e.date)}</span>
                    <div className="flex items-center gap-4">
                      {e.weight && <span className="font-bold">{toFa(e.weight)} <span className="text-xs font-normal text-muted-foreground">kg</span></span>}
                      {e.bodyFat && <span className="text-amber-700">چربی {toFa(e.bodyFat)}٪</span>}
                      {e.muscleMass && <span className="text-emerald-700">عضله {toFa(e.muscleMass)}kg</span>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function MeasurementForm({ onDone }: { onDone: () => void }) {
  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [muscleMass, setMuscleMass] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api('/api/athlete/progress', { method: 'POST', body: { weight, bodyFat, muscleMass, notes } })
      toast({ title: 'اندازه‌گیری ثبت شد' })
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
        <DialogTitle>ثبت اندازه‌گیری جدید</DialogTitle>
        <DialogDescription>فقط وزن الزامی است</DialogDescription>
      </DialogHeader>
      <div className="space-y-1.5">
        <Label>وزن (کیلوگرم) *</Label>
        <Input dir="ltr" type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>درصد چربی</Label>
          <Input dir="ltr" type="number" step="0.1" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>جرم عضلانی</Label>
          <Input dir="ltr" type="number" step="0.1" value={muscleMass} onChange={(e) => setMuscleMass(e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>یادداشت</Label>
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <Button type="submit" className="w-full" disabled={saving}>{saving ? '...' : 'ثبت'}</Button>
    </form>
  )
}
