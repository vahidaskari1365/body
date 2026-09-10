import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUserFromRequest, unauthorized, forbidden } from '@/lib/auth'

// GET athlete full detail for coach
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'COACH') return forbidden()
  const { id } = await params

  const athlete = await db.user.findFirst({
    where: { id, role: 'ATHLETE', athleteProfile: { coachId: user.id } },
    include: {
      athleteProfile: true,
      programAssignments: {
        include: { program: { include: { sessions: { include: { exercises: { include: { exercise: true } } } } } } },
      },
      workoutLogs: { orderBy: { date: 'desc' }, take: 30, include: { session: { select: { title: true } } } },
      progressEntries: { orderBy: { date: 'asc' }, take: 50 },
      paymentsReceived: { orderBy: { date: 'desc' } },
    },
  })
  if (!athlete) return Response.json({ error: 'ورزشکار یافت نشد' }, { status: 404 })

  return Response.json({ athlete })
}

// PATCH update athlete profile
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'COACH') return forbidden()
  const { id } = await params

  const body = await req.json()
  const { name, phone, height, weight, sport, goal, level, birthDate, medicalNotes, status } = body
  const data: Record<string, unknown> = {}
  if (height !== undefined) data.height = height === null || height === '' ? null : parseFloat(height)
  if (weight !== undefined) data.weight = weight === null || weight === '' ? null : parseFloat(weight)
  if (sport !== undefined) data.sport = sport
  if (goal !== undefined) data.goal = goal
  if (level !== undefined) data.level = level
  if (birthDate !== undefined) data.birthDate = birthDate
  if (medicalNotes !== undefined) data.medicalNotes = medicalNotes
  if (status !== undefined) data.status = status

  const target = await db.user.findFirst({ where: { id, role: 'ATHLETE' } })
  if (!target) return Response.json({ error: 'ورزشکار یافت نشد' }, { status: 404 })

  await db.user.update({ where: { id }, data: { name: name ?? target.name, phone: phone ?? target.phone } })
  const updated = await db.athleteProfile.upsert({
    where: { userId: id },
    update: data,
    create: { userId: id, coachId: user.id, ...data },
  })
  return Response.json({ profile: updated })
}
