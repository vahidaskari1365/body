'use client'

import { useState } from 'react'
import {
  LayoutDashboard, Users, Dumbbell, ClipboardList, CalendarDays,
  MessageCircle, Wallet, BarChart3, LogOut, Menu, X, Flame, User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { AuthUser, ROLE_LABEL } from '@/lib/client'

export interface NavItem {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

export function AppShell({
  user,
  navItems,
  activeView,
  onViewChange,
  children,
  onLogout,
}: {
  user: AuthUser
  navItems: NavItem[]
  activeView: string
  onViewChange: (key: string) => void
  children: React.ReactNode
  onLogout: () => void
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const nav = (item: NavItem) => (
    <button
      key={item.key}
      onClick={() => {
        onViewChange(item.key)
        setMobileOpen(false)
      }}
      className={cn(
        'w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
        activeView === item.key
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <item.icon className="w-5 h-5 shrink-0" />
      <span className="flex-1 text-right">{item.label}</span>
      {!!item.badge && (
        <span className={cn(
          'min-w-5 h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center',
          activeView === item.key ? 'bg-white/25 text-white' : 'bg-amber-500 text-white'
        )}>
          {item.badge.toLocaleString('fa-IR')}
        </span>
      )}
    </button>
  )

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="منو">
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Flame className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-extrabold text-lg">فیت‌کوچ</span>
              <span className="hidden md:inline text-xs text-muted-foreground border rounded-full px-2.5 py-0.5 mr-1">
                {ROLE_LABEL[user.role]}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9">
              <AvatarFallback className="bg-emerald-100 text-emerald-800 font-bold">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold leading-tight">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
            <Button variant="ghost" size="icon" onClick={onLogout} aria-label="خروج" title="خروج">
              <LogOut className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 border-l bg-card p-4 gap-1 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          {navItems.map(nav)}
          <div className="mt-auto pt-4">
            <div className="rounded-xl bg-gradient-to-tl from-emerald-600 to-emerald-800 text-white p-4 text-xs leading-relaxed">
              <div className="font-bold text-sm mb-1">فیت‌کوچ پرو</div>
              نسخه دمو — قابل توسعه با اشتراک، اپ موبایل و تحلیل پیشرفته
            </div>
          </div>
        </aside>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            <div className="absolute top-0 right-0 h-full w-72 bg-card shadow-xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                    <Flame className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="font-extrabold">فیت‌کوچ</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="بستن">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              {navItems.map(nav)}
              <div className="mt-auto">
                <Button variant="outline" className="w-full justify-start gap-2" onClick={onLogout}>
                  <LogOut className="w-4 h-4" /> خروج از حساب
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 pb-20 lg:pb-6">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-card border-t" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex justify-around py-1.5">
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.key}
              onClick={() => onViewChange(item.key)}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium relative min-w-[44px]',
                activeView === item.key ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
              {!!item.badge && (
                <span className="absolute -top-0.5 left-1 min-w-4 h-4 px-1 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {item.badge.toLocaleString('fa-IR')}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export const COACH_NAV: NavItem[] = [
  { key: 'dashboard', label: 'داشبورد', icon: LayoutDashboard },
  { key: 'athletes', label: 'ورزشکاران', icon: Users },
  { key: 'programs', label: 'برنامه‌های تمرینی', icon: ClipboardList },
  { key: 'exercises', label: 'بانک حرکات', icon: Dumbbell },
  { key: 'calendar', label: 'تقویم', icon: CalendarDays },
  { key: 'messages', label: 'پیام‌ها', icon: MessageCircle },
  { key: 'finance', label: 'مالی', icon: Wallet },
  { key: 'reports', label: 'گزارش‌ها', icon: BarChart3 },
]

export const ATHLETE_NAV: NavItem[] = [
  { key: 'dashboard', label: 'خانه', icon: LayoutDashboard },
  { key: 'programs', label: 'برنامه من', icon: ClipboardList },
  { key: 'progress', label: 'پیشرفت', icon: TrendingUpNav },
  { key: 'history', label: 'سوابق', icon: User },
  { key: 'messages', label: 'پیام‌ها', icon: MessageCircle },
]

function TrendingUpNav(props: { className?: string }) {
  return <BarChart3 {...props} />
}
