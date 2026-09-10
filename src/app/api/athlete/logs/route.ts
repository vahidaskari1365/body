import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUserFromRequest, unauthorized, forbidden } from '@/lib/auth'

// GET history / POST new workout log
export async function GET(req: NextRequest) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'ATHLETE') return forbidden()

  const logs = await db.workoutLog.findMany({
    where: { athleteId: user.id },
    orderBy: { date: 'desc' },
    take: 100,
    include: {
      session: { select: { title: true, weekNumber: true, dayNumber: true, program: { select: { title: true } } } },
      exerciseLogs: true,
    },
  })
  return Response.json({ logs })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'ATHLETE') return forbidden()

  const { sessionId, status, duration, rating, notes, exerciseLogs } = await req.json()
  if (!sessionId) return Response.json({ error: 'انتخاب جلسه تمرینی الزامی است' }, { status: 400 })

  const session = await db.workoutSession.findFirst({
    where: { id: sessionId, program: { assignments: { some: { athleteId: user.id, status: 'ACTIVE' } } } },
  })
  if (!session) return Response.json({ error: 'جلسه یافت نشد یا به شما تعلق ندارد' }, { status: 404 })

  const log = await db.workoutLog.create({
    data: {
      athleteId: user.id,
      sessionId,
      title: session.title,
      status: status || 'COMPLETED',
      duration: duration ? parseInt(duration) : null,
      rating: rating ? parseInt(rating) : null,
      notes: notes || null,
      exerciseLogs: {
        create: Array.isArray(exerciseLogs)
          ? exerciseLogs.map((el: { exerciseId?: string; exerciseName: string; actualSets?: string | number; actualReps?: string; actualWeight?: string; notes?: string }) => ({
              exerciseId: el.exerciseId || null,
              exerciseName: el.exerciseName,
              actualSets: el.actualSets ? parseInt(String(el.actualSets)) : null,
              actualReps: el.actualReps ? String(el.actualReps) : null,
              actualWeight: el.actualWeight ? String(el.actualWeight) : null,
              notes: el.notes || null,
            }))
          : [],
      },
    },
    include: { exerciseLogs: true },
  })
  return Response.json({ log }, { status: 201 })
}
