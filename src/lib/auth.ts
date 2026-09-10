import { NextRequest } from 'next/server'
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'
import { db } from '@/lib/db'

const COOKIE_NAME = 'fc_session'
const SESSION_DAYS = 30

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(':')
    const hashBuf = Buffer.from(hash, 'hex')
    const testBuf = scryptSync(password, salt, 64)
    return timingSafeEqual(hashBuf, testBuf)
  } catch {
    return false
  }
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
  await db.session.create({ data: { token, userId, expiresAt } })
  return { token, expiresAt }
}

export function getSessionUserFromRequest(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  return getSessionUserByToken(token)
}

export async function getSessionUserByToken(token: string) {
  const session = await db.session.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          athleteProfile: true,
        },
      },
    },
  })
  if (!session) return null
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {})
    return null
  }
  return session.user
}

export const sessionCookieName = COOKIE_NAME

export function cookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: false,
    path: '/',
    expires: expiresAt,
  }
}

export function unauthorized() {
  return Response.json({ error: 'ابتدا وارد حساب کاربری خود شوید' }, { status: 401 })
}

export function forbidden() {
  return Response.json({ error: 'دسترسی به این بخش مجاز نیست' }, { status: 403 })
}
