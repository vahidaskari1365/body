import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { name, email, password, role, phone } = await req.json()
    if (!name || !email || !password || !role) {
      return Response.json({ error: 'همه فیلدها الزامی است' }, { status: 400 })
    }
    if (password.length < 6) {
      return Response.json({ error: 'رمز عبور باید حداقل ۶ کاراکتر باشد' }, { status: 400 })
    }
    if (!['COACH', 'ATHLETE'].includes(role)) {
      return Response.json({ error: 'نقش نامعتبر است' }, { status: 400 })
    }
    const exists = await db.user.findUnique({ where: { email: email.trim().toLowerCase() } })
    if (exists) {
      return Response.json({ error: 'این ایمیل قبلاً ثبت شده است' }, { status: 409 })
    }
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashPassword(password),
        role,
        phone: phone || null,
        athleteProfile: role === 'ATHLETE' ? { create: {} } : undefined,
      },
    })
    return Response.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } }, { status: 201 })
  } catch (e) {
    console.error('register error', e)
    return Response.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
