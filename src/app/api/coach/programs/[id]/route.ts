import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUserFromRequest, unauthorized, forbidden } from '@/lib/auth'

// GET single program with full detail (sessions + exercises)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'COACH') return forbidden()
  const { id } = await params

  const program = await db.program.findFirst({
    where: { id, coachId: user.id },
    include: {
      sessions: {
        orderBy: [{ weekNumber: 'asc' }, { dayNumber: 'asc' }],
        include: {
          exercises: {
            orderBy: { order: 'asc' },
            include: { exercise: true },
          },
        },
      },
      assignments: { include: { athlete: { select: { id: true, name: true, email: true } } } },
    },
  })
  if (!program) return Response.json({ error: 'برنامه یافت نشد' }, { status: 404 })
  return Response.json({ program })
}

// PATCH update program
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'COACH') return forbidden()
  const { id } = await params

  const body = await req.json()
  const program = await db.program.findFirst({ where: { id, coachId: user.id } })
  if (!program) return Response.json({ error: 'برنامه یافت نشد' }, { status: 404 })

  const { title, description, goal, level, durationWeeks, daysPerWeek, status } = body
  const updated = await db.program.update({
    where: { id },
    data: {
      title: title?.trim() ?? program.title,
      description: description ?? program.description,
      goal: goal ?? program.goal,
      level: level ?? program.level,
      durationWeeks: durationWeeks ? parseInt(durationWeeks) : program.durationWeeks,
      daysPerWeek: daysPerWeek ? parseInt(daysPerWeek) : program.daysPerWeek,
      status: status ?? program.status,
    },
  })
  return Response.json({ program: updated })
}

// DELETE program
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'COACH') return forbidden()
  const { id } = await params

  const program = await db.program.findFirst({ where: { id, coachId: user.id } })
  if (!program) return Response.json({ error: 'برنامه یافت نشد' }, { status: 404 })

  await db.programAssignment.deleteMany({ where: { programId: id } })
  await db.sessionExercise.deleteMany({ where: { sessionId: { in: (await db.workoutSession.findMany({ where: { programId: id }, select: { id: true } })).map((s) => s.id) } } })
  await db.workoutLog.updateMany({ where: { sessionId: { in: (await db.workoutSession.findMany({ where: { programId: id }, select: { id: true } })).map((s) => s.id) } }, data: { sessionId: null } })
  await db.workoutSession.deleteMany({ where: { programId: id } })
  await db.program.delete({ where: { id } })
  return Response.json({ ok: true })
}
