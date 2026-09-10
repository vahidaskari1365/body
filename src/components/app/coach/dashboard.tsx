'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, ClipboardList, Dumbbell, Wallet, TrendingUp, CheckCircle2 } from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts'
import { useFetch, toFa, faMoney, faDateShort, faTime } from '@/lib/client'
import { StatCard, LoadingList, EmptyState, StatusBadge } from '@/components/app/shared/ui-bits'

interface DashboardData {
  stats: {
    athleteCount: number
    activePrograms: number
    totalExercises: number
    monthIncome: number
    totalIncome: number
    pendingPayments: number
    unreadMessages: number
    weekLogs: { total: number; completed: number }
  }
  latestLogs: {
    id: string
    status: string
    date: string
    athlete: { name: string }
    session?: { title: string } | null
  }[]
  adherenceChart: { name: string; value: number }[]
}

export function CoachDashboard({ onViewChange }: { onViewChange: (v: string) => void }) {
  const { data, loading } = useFetch<DashboardData>('/api/coach/dashboard')

  if (loading || !data) {
    return (
      <div className="p-4 lg:p-6 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
        <LoadingList rows={2} />
      </div>
    )
  }

  const { stats } = data
  const adherenceRate = stats.weekLogs.total ? Math.round((stats.weekLogs.completed / stats.weekLogs.total) * 100) : 0

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-6xl">
      <div>
        <h1 className="text-xl lg:text-2xl font-extrabold">داشبورد مربی</h1>
        <p className="text-sm text-muted-foreground mt-1">نمای کلی وضعیت ورزشکاران و فعالیت‌ها</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="ورزشکاران فعال" value={stats.athleteCount} icon={Users} />
        <StatCard title="برنامه‌های فعال" value={stats.activePrograms} icon={ClipboardList} tone="amber" />
        <StatCard title="درآمد این ماه" value={faMoney(stats.monthIncome)} icon={Wallet} />
        <StatCard title="حرکات ثبت‌شده" value={stats.totalExercises} icon={Dumbbell} tone="amber" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* adherence chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              درصد تبعیت ورزشکاران (تمام تمرین‌ها)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {data.adherenceChart.length === 0 ? (
              <EmptyState title="داده‌ای برای نمایش نیست" description="پس از ثبت تمرین‌ها توسط ورزشکاران، نمودار نمایش داده می‌شود" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.adherenceChart} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis type="category" dataKey="name" width={80} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v) => [`${toFa(v as number)}٪`, 'تبعیت']} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={22}>
                    {data.adherenceChart.map((entry, i) => (
                      <Cell key={i} fill={entry.value >= 70 ? '#059669' : entry.value >= 40 ? '#f59e0b' : '#f43f5e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* latest activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              آخرین تمرین‌های ثبت‌شده
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.latestLogs.length === 0 ? (
              <EmptyState title="هنوز تمرینی ثبت نشده" description="ورزشکاران شما پس از انجام تمرین، نتایج را ثبت می‌کنند" />
            ) : (
              <div className="space-y-2.5">
                {data.latestLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between gap-3 rounded-xl border p-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">{log.athlete.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {log.session?.title || 'تمرین آزاد'} — {faDateShort(log.date)} {faTime(log.date)}
                      </p>
                    </div>
                    <StatusBadge status={log.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* week summary */}
      <Card>
        <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-bold">خلاصه هفته اخیر</p>
            <p className="text-sm text-muted-foreground mt-1">
              {toFa(stats.weekLogs.completed)} تمرین کامل از {toFa(stats.weekLogs.total)} تمرین ثبت‌شده — نرخ تبعیت {toFa(adherenceRate)}٪
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onViewChange('reports')}
              className="text-sm font-semibold text-primary hover:underline"
            >
              مشاهده گزارش کامل
            </button>
            <span className="text-muted-foreground">|</span>
            <button
              onClick={() => onViewChange('messages')}
              className="text-sm font-semibold text-primary hover:underline"
            >
              پیام‌ها {stats.unreadMessages > 0 && `(${toFa(stats.unreadMessages)})`}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
