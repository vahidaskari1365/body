'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useFetch, api, toFa, faMoney, faDateShort, METHOD_LABEL } from '@/lib/client'
import { toast } from '@/hooks/use-toast'
import { LoadingList, EmptyState, StatusBadge, StatCard } from '@/components/app/shared/ui-bits'
import { Wallet, Plus, TrendingUp, Clock3, Receipt } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'

interface Payment {
  id: string
  amount: number
  title: string
  method?: string | null
  status: string
  date: string
  notes?: string | null
  athlete: { id: string; name: string }
}

export function FinanceView() {
  const { data, loading, refresh } = useFetch<{ payments: Payment[]; summary: { total: number; thisMonth: number; pending: number; count: number }; monthly: { month: number; amount: number }[] }>('/api/payments')
  const [open, setOpen] = useState(false)

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold">مدیریت مالی</h1>
          <p className="text-sm text-muted-foreground mt-1">ثبت پرداختی‌ها و بررسی درآمد</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 ml-1" /> ثبت پرداختی</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <PaymentForm onDone={() => { setOpen(false); refresh() }} />
          </DialogContent>
        </Dialog>
      </div>

      {loading || !data ? (
        <LoadingList rows={4} />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard title="درآمد کل" value={faMoney(data.summary.total)} icon={Wallet} />
            <StatCard title="این ماه" value={faMoney(data.summary.thisMonth)} icon={TrendingUp} tone="amber" />
            <StatCard title="در انتظار" value={faMoney(data.summary.pending)} icon={Clock3} tone="rose" />
            <StatCard title="تعداد تراکنش" value={data.summary.count} icon={Receipt} />
          </div>

          <Card>
            <CardContent className="p-4">
              <h2 className="font-bold text-sm mb-3">روند درآمد ۶ ماه اخیر</h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.monthly.map((m) => ({ ...m, label: new Intl.DateTimeFormat('fa-IR', { month: 'long' }).format(new Date(2024, m.month - 1, 1)) }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                    <XAxis dataKey="label" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} width={45} tickFormatter={(v) => `${toFa(Math.round(Number(v) / 1000000))}م`} />
                    <Tooltip formatter={(v) => [faMoney(Number(v)), 'درآمد']} />
                    <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                      {data.monthly.map((_, i) => (
                        <Cell key={i} fill={i === data.monthly.length - 1 ? '#059669' : '#6ee7b7'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="font-bold text-sm mb-3">تراکنش‌ها</h2>
              {data.payments.length === 0 ? (
                <EmptyState icon={Wallet} title="تراکنشی ثبت نشده" description="اولین پرداختی ورزشکار را ثبت کنید" />
              ) : (
                <div className="space-y-2">
                  {data.payments.map((p) => (
                    <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm">{p.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {p.athlete.name} — {faDateShort(p.date)}{p.method ? ` — ${METHOD_LABEL[p.method] || p.method}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-sm">{faMoney(p.amount)}</span>
                        <StatusBadge status={p.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function PaymentForm({ onDone }: { onDone: () => void }) {
  const { data } = useFetch<{ athletes: { id: string; name: string }[] }>('/api/coach/athletes')
  const [athleteId, setAthleteId] = useState('')
  const [amount, setAmount] = useState('')
  const [title, setTitle] = useState('')
  const [method, setMethod] = useState('CARD')
  const [status, setStatus] = useState('PAID')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [saving, setSaving] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api('/api/payments', { method: 'POST', body: { athleteId, amount, title, method, status, date } })
      toast({ title: 'تراکنش ثبت شد' })
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
        <DialogTitle>ثبت پرداختی جدید</DialogTitle>
        <DialogDescription>شهریه یا پرداختی ورزشکار را ثبت کنید</DialogDescription>
      </DialogHeader>
      <div className="space-y-1.5">
        <Label>ورزشکار *</Label>
        <Select value={athleteId} onValueChange={setAthleteId} dir="rtl">
          <SelectTrigger><SelectValue placeholder="انتخاب ورزشکار" /></SelectTrigger>
          <SelectContent>
            {(data?.athletes || []).map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>عنوان *</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="شهریه ماهانه، جلسه خصوصی..." />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>مبلغ (تومان) *</Label>
          <Input dir="ltr" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>تاریخ</Label>
          <Input dir="ltr" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>روش پرداخت</Label>
          <Select value={method} onValueChange={setMethod} dir="rtl">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(METHOD_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>وضعیت</Label>
          <Select value={status} onValueChange={setStatus} dir="rtl">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PAID">پرداخت شده</SelectItem>
              <SelectItem value="PENDING">در انتظار</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={saving || !athleteId}>{saving ? '...' : 'ثبت تراکنش'}</Button>
    </form>
  )
}
