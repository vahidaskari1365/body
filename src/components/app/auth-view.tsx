'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dumbbell, Loader2, MessageCircle, CalendarDays, TrendingUp, Video } from 'lucide-react'
import { api, AuthUser } from '@/lib/client'
import { toast } from '@/hooks/use-toast'
import { LoginForm, RegisterForm } from './auth-forms'

interface Props {
  onLogin: (user: AuthUser) => void
}

export function AuthView({ onLogin }: Props) {
  const [loading, setLoading] = useState<string | null>(null)

  async function login(email: string, password: string, tag: string) {
    setLoading(tag)
    try {
      const res = await api<{ user: AuthUser }>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      })
      onLogin(res.user)
    } catch (e) {
      toast({ title: 'خطا در ورود', description: e instanceof Error ? e.message : '', variant: 'destructive' })
    } finally {
      setLoading(null)
    }
  }

  async function register(data: { name: string; email: string; password: string; role: string }, tag: string) {
    setLoading(tag)
    try {
      await api('/api/auth/register', { method: 'POST', body: data })
      await login(data.email, data.password, tag)
    } catch (e) {
      toast({ title: 'خطا در ثبت‌نام', description: e instanceof Error ? e.message : '', variant: 'destructive' })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Hero side */}
      <div className="relative flex-1 bg-gradient-to-bl from-emerald-700 via-emerald-600 to-emerald-800 text-white flex flex-col justify-center p-8 lg:p-16 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 w-80 h-80 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="relative max-w-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
              <Dumbbell className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold">فیت‌کوچ</h1>
              <p className="text-emerald-100 text-sm">پلتفرم مدیریت مربیان و ورزشکاران</p>
            </div>
          </div>
          <h2 className="text-2xl lg:text-4xl font-bold leading-relaxed mb-4">
            تمام فرآیند کاری‌ات با ورزشکارانت، در یک سیستم
          </h2>
          <p className="text-emerald-100 leading-relaxed mb-10">
            از ساخت برنامه تمرینی و تقویم جلسات تا ثبت نتایج، تحلیل پیشرفت، پیام‌رسانی و مدیریت مالی — همه‌چیز در یک پنل ساده و حرفه‌ای.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: CalendarDays, title: 'برنامه و تقویم', desc: 'ساخت برنامه هفتگی و ارسال به ورزشکار' },
              { icon: Video, title: 'بانک حرکات', desc: 'ویدئوی آموزشی برای هر حرکت' },
              { icon: TrendingUp, title: 'تحلیل پیشرفت', desc: 'نمودار عملکرد و نتایج تمرین' },
              { icon: MessageCircle, title: 'پیام‌رسانی', desc: 'ارتباط مستقیم مربی و ورزشکار' },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3 bg-white/10 backdrop-blur rounded-xl p-4">
                <f.icon className="w-6 h-6 shrink-0 text-amber-300" />
                <div>
                  <div className="font-semibold text-sm">{f.title}</div>
                  <div className="text-xs text-emerald-100 mt-1">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          <Tabs defaultValue="login" dir="rtl">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">ورود</TabsTrigger>
              <TabsTrigger value="register">ثبت‌نام</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>ورود به حساب کاربری</CardTitle>
                  <CardDescription>ایمیل و رمز عبور خود را وارد کنید</CardDescription>
                </CardHeader>
                <CardContent>
                  <LoginForm onSubmit={(d) => login(d.email, d.password, 'login')} loading={loading === 'login'} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>ایجاد حساب جدید</CardTitle>
                  <CardDescription>به‌عنوان مربی یا ورزشکار ثبت‌نام کنید</CardDescription>
                </CardHeader>
                <CardContent>
                  <RegisterForm onSubmit={(d) => register(d, 'register')} loading={loading === 'register'} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Demo accounts */}
          <div className="mt-6 rounded-xl border bg-muted/50 p-4">
            <p className="text-sm font-medium mb-3 text-muted-foreground">حساب‌های نمونه برای تست سریع:</p>
            <div className="grid gap-2">
              <Button
                variant="outline"
                className="justify-between"
                disabled={!!loading}
                onClick={() => login('coach@fitcoach.ir', '123456', 'demo-coach')}
              >
                <span>ورود به‌عنوان مربی (رضا کریمی)</span>
                {loading === 'demo-coach' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Dumbbell className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                className="justify-between"
                disabled={!!loading}
                onClick={() => login('ali@fitcoach.ir', '123456', 'demo-athlete')}
              >
                <span>ورود به‌عنوان ورزشکار (علی محمدی)</span>
                {loading === 'demo-athlete' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Dumbbell className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
