import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, createSession, sessionCookieName, cookieOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return Response.json({ error: 'ایمیل و رمز عبور الزامی است' }, { status: 400 })
    }
    const user = await db.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: { athleteProfile: true },
    })
    if (!user || !verifyPassword(password, user.password)) {
      return Response.json({ error: 'ایمیل یا رمز عبور اشتباه است' }, { status: 401 })
    }
    const { token, expiresAt } = await createSession(user.id)
    const res = Response.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, athleteProfile: user.athleteProfile },
    })
    const opts = cookieOptions(expiresAt)
    res.headers.append(
      'Set-Cookie',
      `${sessionCookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}`
    )
    return res
  } catch (e) {
    console.error('login error', e)
    return Response.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
