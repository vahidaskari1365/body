'use client'

import dynamic from 'next/dynamic'
import { useState, type ComponentType } from 'react'
import { AuthView } from '@/components/app/auth-view'
import { LandingPage } from '@/components/app/landing'
import { api, useFetch, AuthUser } from '@/lib/client'
import {
  Loader2,
  LayoutDashboard, Users, ClipboardList, Dumbbell, CalendarDays,
  MessageCircle, Wallet, BarChart3,
} from 'lucide-react'

interface NavItem {
  key: string
  label: string
  icon: ComponentType<{ className?: string }>
  badge?: number
}

const COACH_NAV: NavItem[] = [
  { key: 'dashboard', label: 'داشبورد', icon: LayoutDashboard },
  { key: 'athletes', label: 'ورزشکاران', icon: Users },
  { key: 'programs', label: 'برنامه‌های تمرینی', icon: ClipboardList },
  { key: 'exercises', label: 'بانک حرکات', icon: Dumbbell },
  { key: 'calendar', label: 'تقویم', icon: CalendarDays },
  { key: 'messages', label: 'پیام‌ها', icon: MessageCircle },
  { key: 'finance', label: 'مالی', icon: Wallet },
  { key: 'reports', label: 'گزارش‌ها', icon: BarChart3 },
]

const ATHLETE_NAV: NavItem[] = [
  { key: 'dashboard', label: 'خانه', icon: LayoutDashboard },
  { key: 'programs', label: 'برنامه من', icon: ClipboardList },
  { key: 'progress', label: 'پیشرفت', icon: BarChart3 },
  { key: 'history', label: 'سوابق', icon: Users },
  { key: 'messages', label: 'پیام‌ها', icon: MessageCircle },
]

/* ---------- code splitting ----------
 * ویوهای پنل همه به‌صورت تنبل بارگذاری می‌شوند؛
 * بازدیدکننده‌ی لندینگ فقط کد لندینگ را دانلود می‌کند و
 * هر ویو فقط در لحظه‌ی استفاده fetch/compile می‌شود.
 * recharts و بقیه‌ی وابستگی‌های سنگین دیگر در باندل اولیه نیستند.
 * ------------------------------------------------ */

function ViewLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  )
}

const AppShell = dynamic(() => import('@/components/app/shell').then((m) => m.AppShell), { loading: ViewLoader })
const CoachDashboard = dynamic(() => import('@/components/app/coach/dashboard').then((m) => m.CoachDashboard), { loading: ViewLoader })
const AthletesView = dynamic(() => import('@/components/app/coach/athletes').then((m) => m.AthletesView), { loading: ViewLoader })
const ExercisesView = dynamic(() => import('@/components/app/coach/exercises').then((m) => m.ExercisesView), { loading: ViewLoader })
const ProgramsView = dynamic(() => import('@/components/app/coach/programs').then((m) => m.ProgramsView), { loading: ViewLoader })
const CoachCalendar = dynamic(() => import('@/components/app/coach/calendar').then((m) => m.CoachCalendar), { loading: ViewLoader })
const FinanceView = dynamic(() => import('@/components/app/coach/finance').then((m) => m.FinanceView), { loading: ViewLoader })
const ReportsView = dynamic(() => import('@/components/app/coach/reports').then((m) => m.ReportsView), { loading: ViewLoader })
const AthleteDashboard = dynamic(() => import('@/components/app/athlete/dashboard').then((m) => m.AthleteDashboard), { loading: ViewLoader })
const AthletePrograms = dynamic(() => import('@/components/app/athlete/programs').then((m) => m.AthletePrograms), { loading: ViewLoader })
const AthleteLogForm = dynamic(() => import('@/components/app/athlete/log').then((m) => m.AthleteLogForm), { loading: ViewLoader })
const AthleteProgress = dynamic(() => import('@/components/app/athlete/progress').then((m) => m.AthleteProgress), { loading: ViewLoader })
const AthleteHistory = dynamic(() => import('@/components/app/athlete/history').then((m) => m.AthleteHistory), { loading: ViewLoader })
const MessagesView = dynamic(() => import('@/components/app/shared/messages').then((m) => m.MessagesView), { loading: ViewLoader })

export default function Home() {
  const { data } = useFetch<{ user: AuthUser | null }>('/api/auth/me')
  const [view, setView] = useState('dashboard')
  const [screen, setScreen] = useState<'landing' | 'auth'>('landing')
  const [logSessionId, setLogSessionId] = useState<string | undefined>(undefined)
  const [logKey, setLogKey] = useState(0)

  async function logout() {
    await api('/api/auth/logout', { method: 'POST' }).catch(() => {})
    window.location.reload()
  }

  const user = data?.user ?? null

  /* لندینگ بلافاصله رندر می‌شود و منتظر پاسخ /api/auth/me نمی‌ماند؛
   * سشن در پس‌زمینه بررسی می‌شود و اگر کاربر وارد شده باشد،
   * پنل او جایگزین می‌شود. */
  if (!user) {
    return screen === 'landing' ? (
      <LandingPage onEnter={() => setScreen('auth')} />
    ) : (
      <AuthView onLogin={() => window.location.reload()} onBack={() => setScreen('landing')} />
    )
  }

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
