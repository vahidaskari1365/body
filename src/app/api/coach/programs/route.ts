import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUserFromRequest, unauthorized, forbidden } from '@/lib/auth'

// GET all programs of coach
export async function GET(req: NextRequest) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'COACH') return forbidden()

  const programs = await db.program.findMany({
    where: { coachId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { sessions: true, assignments: true } },
      assignments: {
        include: { athlete: { select: { id: true, name: true } } },
      },
    },
  })
  return Response.json({ programs })
}

// POST create program
export async function POST(req: NextRequest) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'COACH') return forbidden()

  const body = await req.json()
  const { title, description, goal, level, durationWeeks, daysPerWeek } = body
  if (!title) return Response.json({ error: 'عنوان برنامه الزامی است' }, { status: 400 })

  const program = await db.program.create({
    data: {
      coachId: user.id,
      title: title.trim(),
      description: description || null,
      goal: goal || null,
      level: level || null,
      durationWeeks: parseInt(durationWeeks) || 4,
      daysPerWeek: parseInt(daysPerWeek) || 3,
    },
  })
  return Response.json({ program }, { status: 201 })
}
