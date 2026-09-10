'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

export function LoginForm({
  onSubmit,
  loading,
}: {
  onSubmit: (data: { email: string; password: string }) => void
  loading: boolean
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({ email, password })
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="email">ایمیل</Label>
        <Input
          id="email"
          type="email"
          dir="ltr"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">رمز عبور</Label>
        <Input
          id="password"
          type="password"
          dir="ltr"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
        ورود به پنل
      </Button>
    </form>
  )
}

export function RegisterForm({
  onSubmit,
  loading,
}: {
  onSubmit: (data: { name: string; email: string; password: string; role: string }) => void
  loading: boolean
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('COACH')

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({ name, email, password, role })
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="rname">نام و نام خانوادگی</Label>
        <Input id="rname" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="remail">ایمیل</Label>
        <Input id="remail" type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="rpass">رمز عبور</Label>
        <Input id="rpass" type="password" dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>نقش شما</Label>
        <Select value={role} onValueChange={setRole} dir="rtl">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="COACH">مربی ورزشی</SelectItem>
            <SelectItem value="ATHLETE">ورزشکار</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
        ایجاد حساب کاربری
      </Button>
    </form>
  )
}
