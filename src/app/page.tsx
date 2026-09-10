'use client'

import { useState } from 'react'
import { AuthView } from '@/components/app/auth-view'
import { LandingPage } from '@/components/app/landing'
import { AppShell, COACH_NAV, ATHLETE_NAV } from '@/components/app/shell'
import { CoachDashboard } from '@/components/app/coach/dashboard'
import { AthletesView } from '@/components/app/coach/athletes'
import { ExercisesView } from '@/components/app/coach/exercises'
import { ProgramsView } from '@/components/app/coach/programs'
import { CoachCalendar } from '@/components/app/coach/calendar'
import { FinanceView } from '@/components/app/coach/finance'
import { ReportsView } from '@/components/app/coach/reports'
import { AthleteDashboard } from '@/components/app/athlete/dashboard'
import { AthletePrograms } from '@/components/app/athlete/programs'
import { AthleteLogForm } from '@/components/app/athlete/log'
import { AthleteProgress } from '@/components/app/athlete/progress'
import { AthleteHistory } from '@/components/app/athlete/history'
import { MessagesView } from '@/components/app/shared/messages'
import { api, useFetch, AuthUser } from '@/lib/client'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const { data, loading } = useFetch<{ user: AuthUser | null }>('/api/auth/me')
  const [view, setView] = useState('dashboard')
  const [screen, setScreen] = useState<'landing' | 'auth'>('landing')
  const [logSessionId, setLogSessionId] = useState<string | undefined>(undefined)
  const [logKey, setLogKey] = useState(0)

  async function logout() {
    await api('/api/auth/logout', { method: 'POST' }).catch(() => {})
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">در حال بارگذاری فیت‌کوچ...</p>
        </div>
      </div>
    )
  }

  if (!data?.user) {
    return screen === 'landing' ? (
      <LandingPage onEnter={() => setScreen('auth')} />
    ) : (
      <AuthView onLogin={() => window.location.reload()} onBack={() => setScreen('landing')} />
    )
  }

  const user = data.user
  const isCoach = user.role === 'COACH'

  const navItems = (isCoach ? COACH_NAV : ATHLETE_NAV).map((n) =>
    n.key === 'messages' ? { ...n } : n
  )

  function startLog(sessionId?: string) {
    setLogSessionId(sessionId)
    setLogKey((k) => k + 1)
    setView('log')
  }

  const content = isCoach ? (
    {
      dashboard: <CoachDashboard onViewChange={setView} />,
      athletes: <AthletesView />,
      programs: <ProgramsView onOpenCalendar={() => setView('calendar')} />,
      exercises: <ExercisesView />,
      calendar: <CoachCalendar />,
      messages: <MessagesView userId={user.id} />,
      finance: <FinanceView />,
      reports: <ReportsView />,
    }[view] || <CoachDashboard onViewChange={setView} />
  ) : (
    {
      dashboard: <AthleteDashboard onViewChange={setView} onStartLog={() => startLog()} />,
      programs: <AthletePrograms onStartLog={(sid) => startLog(sid)} />,
      log: <AthleteLogForm key={logKey} preselectedSessionId={logSessionId} onDone={() => setView('history')} />,
      progress: <AthleteProgress />,
      history: <AthleteHistory />,
      messages: <MessagesView userId={user.id} />,
    }[view] || <AthleteDashboard onViewChange={setView} onStartLog={() => startLog()} />
  )

  return (
    <AppShell user={user} navItems={navItems} activeView={view} onViewChange={setView} onLogout={logout}>
      {content}
    </AppShell>
  )
}
