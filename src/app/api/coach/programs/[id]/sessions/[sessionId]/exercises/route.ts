import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUserFromRequest, unauthorized, forbidden } from '@/lib/auth'

// POST add exercise to session
export async function POST(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'COACH') return forbidden()
  const { sessionId } = await params

  const session = await db.workoutSession.findFirst({
    where: { id: sessionId, program: { coachId: user.id } },
  })
  if (!session) return Response.json({ error: 'جلسه یافت نشد' }, { status: 404 })

  const { exerciseId, sets, reps, weight, restSeconds, notes } = await req.json()
  if (!exerciseId) return Response.json({ error: 'انتخاب حرکت الزامی است' }, { status: 400 })

  const count = await db.sessionExercise.count({ where: { sessionId } })
  const se = await db.sessionExercise.create({
    data: {
      sessionId,
      exerciseId,
      order: count,
      sets: parseInt(sets) || 3,
      reps: String(reps ?? '10'),
      weight: weight ? String(weight) : null,
      restSeconds: parseInt(restSeconds) || 60,
      notes: notes || null,
    },
    include: { exercise: true },
  })
  return Response.json({ sessionExercise: se }, { status: 201 })
}
