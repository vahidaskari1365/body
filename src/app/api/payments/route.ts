import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUserFromRequest, unauthorized, forbidden } from '@/lib/auth'

// GET payments of coach (with summary)
export async function GET(req: NextRequest) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'COACH') return forbidden()

  const payments = await db.payment.findMany({
    where: { coachId: user.id },
    orderBy: { date: 'desc' },
    include: { athlete: { select: { id: true, name: true } } },
  })

  const now = new Date()
  const thisMonth = payments.filter((p) => {
    const d = new Date(p.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && p.status === 'PAID'
  })
  const summary = {
    total: payments.filter((p) => p.status === 'PAID').reduce((s, p) => s + p.amount, 0),
    thisMonth: thisMonth.reduce((s, p) => s + p.amount, 0),
    pending: payments.filter((p) => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0),
    count: payments.length,
  }

  // monthly income for chart (last 6 months)
  const monthly = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    const sum = payments
      .filter((p) => p.status === 'PAID' && new Date(p.date) >= d && new Date(p.date) < next)
      .reduce((s, p) => s + p.amount, 0)
    monthly.push({ month: d.getMonth() + 1, amount: sum })
  }

  return Response.json({ payments, summary, monthly })
}

// POST record payment
export async function POST(req: NextRequest) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'COACH') return forbidden()

  const { athleteId, amount, title, method, status, date, notes } = await req.json()
  if (!athleteId || !amount || !title) {
    return Response.json({ error: 'ورزشکار، مبلغ و عنوان الزامی است' }, { status: 400 })
  }
  const athlete = await db.user.findFirst({
    where: { id: athleteId, role: 'ATHLETE', athleteProfile: { coachId: user.id } },
  })
  if (!athlete) return Response.json({ error: 'ورزشکار یافت نشد' }, { status: 404 })

  const payment = await db.payment.create({
    data: {
      coachId: user.id,
      athleteId,
      amount: parseFloat(amount),
      title: title.trim(),
      method: method || null,
      status: status || 'PAID',
      date: date ? new Date(date) : new Date(),
      notes: notes || null,
    },
    include: { athlete: { select: { name: true } } },
  })
  return Response.json({ payment }, { status: 201 })
}
