'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useFetch, toFa } from '@/lib/client'
import { LoadingList, EmptyState } from '@/components/app/shared/ui-bits'
import { BarChart3, Activity, Clock, Star } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart as RBarChart, Bar } from 'recharts'

interface ReportRow {
  id: string
  name: string
  activePrograms: string[]
  total: number
  completed: number
  partial: number
  skipped: number
  adherence: number
  avgDuration: number
  avgRating: string | null
  weightTrend: { date: string; weight?: number | null }[]
  weeklyActivity: { week: string; count: number }[]
}

export function ReportsView() {
  const { data, loading } = useFetch<{ report: ReportRow[] }>('/api/coach/reports')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (loading) return <div className="p-6"><LoadingList rows={3} /></div>
  const report = data?.report || []
  if (report.length === 0) {
    return (
      <div className="p-6">
        <EmptyState icon={BarChart3} title="گزارشی موجود نیست" description="پس از شروع فعالیت ورزشکاران، آمار عملکرد اینجا نمایش داده می‌شود" />
      </div>
    )
  }

  const selected = report.find((r) => r.id === selectedId) || report[0]
  const weightData = selected.weightTrend
    .filter((w) => w.weight)
    .map((w) => ({
      date: new Intl.DateTimeFormat('fa-IR-u-ca-persian', { month: 'short', day: 'numeric' }).format(new Date(w.date)),
      weight: w.weight,
    }))

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-6xl">
      <div>
        <h1 className="text-xl lg:text-2xl font-extrabold">گزارش عملکرد</h1>
        <p className="text-sm text-muted-foreground mt-1">تحلیل پیشرفت و تبعیت ورزشکاران</p>
      </div>

      {/* athlete selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {report.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedId(r.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold border transition-colors ${
              selected.id === r.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:bg-accent'
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>

      {/* summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" />نرخ تبعیت</p>
            <p className={`text-2xl font-extrabold mt-1 ${selected.adherence >= 70 ? 'text-emerald-600' : selected.adherence >= 40 ? 'text-amber-600' : 'text-rose-600'}`}>
              {toFa(selected.adherence)}٪
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">تمرین‌های کامل</p>
            <p className="text-2xl font-extrabold mt-1">{toFa(selected.completed)} <span className="text-sm text-muted-foreground font-normal">از {toFa(selected.total)}</span></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />میانگین مدت جلسه</p>
            <p className="text-2xl font-extrabold mt-1">{selected.avgDuration ? `${toFa(selected.avgDuration)} دقیقه` : '-'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Star className="w-3.5 h-3.5" />میانگین کیفیت (از ۵)</p>
            <p className="text-2xl font-extrabold mt-1">{selected.avgRating ? toFa(selected.avgRating) : '-'}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* weekly activity */}
        <Card>
          <CardContent className="p-4">
            <h2 className="font-bold text-sm mb-3">فعالیت ۸ هفته اخیر</h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RBarChart data={selected.weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                  <XAxis dataKey="week" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} fontSize={11} tickLine={false} axisLine={false} width={25} />
                  <Tooltip formatter={(v) => [`${toFa(v as number)} تمرین`, 'تعداد']} />
                  <Bar dataKey="count" fill="#059669" radius={[6, 6, 0, 0]} />
                </RBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* weight trend */}
        <Card>
          <CardContent className="p-4">
            <h2 className="font-bold text-sm mb-3">روند وزن</h2>
            <div className="h-56">
              {weightData.length >= 2 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="date" fontSize={10} tickLine={false} />
                    <YAxis domain={['dataMin - 2', 'dataMax + 2']} fontSize={11} tickLine={false} width={35} />
                    <Tooltip formatter={(v) => [`${toFa(v as number)} kg`, 'وزن']} />
                    <Line type="monotone" dataKey="weight" stroke="#059669" strokeWidth={2.5} dot={{ r: 4, fill: '#059669' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title="داده کافی برای نمودار وزن نیست" description="حداقل دو وزن ثبت‌شده لازم است" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* status breakdown */}
      <Card>
        <CardContent className="p-4">
          <h2 className="font-bold text-sm mb-3">وضعیت تمرین‌ها</h2>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-emerald-100 text-emerald-800 border-transparent">کامل: {toFa(selected.completed)}</Badge>
            <Badge className="bg-amber-100 text-amber-800 border-transparent">ناقص: {toFa(selected.partial)}</Badge>
            <Badge className="bg-rose-100 text-rose-800 border-transparent">لغو شده: {toFa(selected.skipped)}</Badge>
          </div>
          {selected.activePrograms.length > 0 && (
            <p className="text-xs text-muted-foreground mt-3">برنامه‌های فعال: {selected.activePrograms.join('، ')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
