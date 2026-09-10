import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUserFromRequest, unauthorized, forbidden } from '@/lib/auth'

// GET sessions of a program
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'COACH') return forbidden()
  const { id } = await params

  const program = await db.program.findFirst({ where: { id, coachId: user.id } })
  if (!program) return Response.json({ error: 'برنامه یافت نشد' }, { status: 404 })

  const sessions = await db.workoutSession.findMany({
    where: { programId: id },
    orderBy: [{ weekNumber: 'asc' }, { dayNumber: 'asc' }],
    include: { exercises: { orderBy: { order: 'asc' }, include: { exercise: true } } },
  })
  return Response.json({ sessions })
}

// POST create session in program
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'COACH') return forbidden()
  const { id } = await params

  const program = await db.program.findFirst({ where: { id, coachId: user.id } })
  if (!program) return Response.json({ error: 'برنامه یافت نشد' }, { status: 404 })

  const { title, weekNumber, dayNumber, dayLabel, focus, notes, scheduledDate, exerciseIds } = await req.json()
  const session = await db.workoutSession.create({
    data: {
      programId: id,
      title: title?.trim() || `جلسه روز ${dayNumber || 1}`,
      weekNumber: parseInt(weekNumber) || 1,
      dayNumber: parseInt(dayNumber) || 1,
      dayLabel: dayLabel || null,
      focus: focus || null,
      notes: notes || null,
      scheduledDate: scheduledDate || null,
    },
  })

  if (Array.isArray(exerciseIds) && exerciseIds.length > 0) {
    let order = 0
    for (const ex of exerciseIds) {
      await db.sessionExercise.create({
        data: {
          sessionId: session.id,
          exerciseId: ex.exerciseId || ex,
          order: order++,
          sets: parseInt(ex.sets) || 3,
          reps: String(ex.reps ?? '10'),
          weight: ex.weight ? String(ex.weight) : null,
          restSeconds: parseInt(ex.restSeconds) || 60,
          notes: ex.notes || null,
        },
      })
    }
  }

  const full = await db.workoutSession.findUnique({
    where: { id: session.id },
    include: { exercises: { orderBy: { order: 'asc' }, include: { exercise: true } } },
  })
  return Response.json({ session: full }, { status: 201 })
}
