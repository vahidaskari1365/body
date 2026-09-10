'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useFetch, toFa, faDateShort, faDayName, faTime, GOAL_LABEL } from '@/lib/client'
import { LoadingList, EmptyState, StatCard, StatusBadge } from '@/components/app/shared/ui-bits'
import { ClipboardList, CheckCircle2, TrendingUp, MessageCircle, PlayCircle, Flame, Dumbbell, Timer } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface AthDash {
  stats: {
    activePrograms: number
    totalLogs: number
    completedLogs: number
    adherence: number
    unreadMessages: number
    currentWeight: number | null
  }
  programs: { id: string; title: string; description?: string | null; goal?: string | null; level?: string | null; durationWeeks: number }[]
  recentLogs: { id: string; status: string; date: string; title?: string | null; session?: { title: string } | null }[]
  progress: { id: string; date: string; weight?: number | null }[]
  coach: { id: string; name: string } | null
}

export function AthleteDashboard({ onViewChange, onStartLog }: { onViewChange: (v: string) => void; onStartLog: () => void }) {
  const { data, loading } = useFetch<AthDash>('/api/athlete/dashboard')

  if (loading || !data) {
    return (
      <div className="p-4 lg:p-6 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
        </div>
        <LoadingList rows={2} />
      </div>
    )
  }

  const weightData = data.progress.filter((p) => p.weight).map((p) => ({
    date: new Intl.DateTimeFormat('fa-IR-u-ca-persian', { month: 'short', day: 'numeric' }).format(new Date(p.date)),
    weight: p.weight,
  }))

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-6xl">
      <div>
        <h1 className="text-xl lg:text-2xl font-extrabold">سلام، آماده تمرین هستی؟ 💪</h1>
        <p className="text-sm text-muted-foreground mt-1">خلاصه وضعیت تمرین‌های تو</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="برنامه‌های فعال" value={data.stats.activePrograms} icon={ClipboardList} />
        <StatCard title="تبعیت تمرینی" value={`${toFa(data.stats.adherence)}٪`} icon={Flame} tone="amber" />
        <StatCard title="تمرین‌های کامل" value={data.stats.completedLogs} icon={CheckCircle2} />
        <StatCard title="وزن فعلی" value={data.stats.currentWeight ? `${toFa(data.stats.currentWeight)} kg` : '-'} icon={TrendingUp} />
      </div>

      {/* CTA */}
      <Card className="bg-gradient-to-l from-emerald-600 to-emerald-800 text-white border-0">
        <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-bold text-lg">ثبت نتایج تمرین امروز</p>
            <p className="text-sm text-emerald-100 mt-1">نتایج را ثبت کن تا مربی‌ات پیشرفتت را ببیند</p>
          </div>
          <Button variant="secondary" onClick={onStartLog} className="bg-white text-emerald-800 hover:bg-emerald-50">
            <PlayCircle className="w-4 h-4 ml-1" /> شروع ثبت تمرین
          </Button>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* programs */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-sm">برنامه‌های من</h2>
              <button className="text-xs text-primary font-semibold hover:underline" onClick={() => onViewChange('programs')}>مشاهده همه</button>
            </div>
            {data.programs.length === 0 ? (
              <EmptyState icon={ClipboardList} title="هنوز برنامه‌ای نداری" description="مربی‌ات هنوز برنامه تمرینی برایت ارسال نکرده است" />
            ) : (
              <div className="space-y-2.5">
                {data.programs.map((p) => (
                  <div key={p.id} className="rounded-xl border p-3.5 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-sm">{p.title}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {p.level && <Badge variant="secondary">{GOAL_LABEL[p.goal || ''] || p.durationWeeks && `${toFa(p.durationWeeks)} هفته`}</Badge>}
                        <Badge variant="secondary">{toFa(p.durationWeeks)} هفته</Badge>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => onViewChange('programs')}>مشاهده</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* weight chart */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-sm">روند وزن</h2>
              <button className="text-xs text-primary font-semibold hover:underline" onClick={() => onViewChange('progress')}>ثبت وزن جدید</button>
            </div>
            <div className="h-48">
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
                <EmptyState title="داده کافی نیست" description="برای نمایش نمودار، وزن خود را در بخش «پیشرفت» ثبت کن" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* recent logs */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-sm">آخرین تمرین‌ها</h2>
            <button className="text-xs text-primary font-semibold hover:underline" onClick={() => onViewChange('history')}>سوابق کامل</button>
          </div>
          {data.recentLogs.length === 0 ? (
            <EmptyState icon={Dumbbell} title="هنوز تمرینی ثبت نکرده‌ای" description="اولین تمرینت را ثبت کن" />
          ) : (
            <div className="space-y-2">
              {data.recentLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between rounded-xl border p-3">
                  <div>
                    <p className="font-semibold text-sm">{log.session?.title || log.title || 'تمرین'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{faDayName(log.date)} — {faDateShort(log.date)} {faTime(log.date)}</p>
                  </div>
                  <StatusBadge status={log.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* coach contact */}
      {data.coach && (
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">{data.coach.name.charAt(0)}</div>
              <div>
                <p className="text-xs text-muted-foreground">مربی تو</p>
                <p className="font-bold text-sm">{data.coach.name}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => onViewChange('messages')}>
              <MessageCircle className="w-4 h-4 ml-1" /> ارسال پیام
              {data.stats.unreadMessages > 0 && <span className="mr-1.5 min-w-5 h-5 px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold inline-flex items-center justify-center">{toFa(data.stats.unreadMessages)}</span>}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
