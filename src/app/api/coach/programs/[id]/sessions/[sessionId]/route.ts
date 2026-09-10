import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUserFromRequest, unauthorized, forbidden } from '@/lib/auth'

// PATCH / DELETE a workout session (verify ownership through program)
async function ownedSession(sessionId: string, coachId: string) {
  return db.workoutSession.findFirst({
    where: { id: sessionId, program: { coachId } },
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'COACH') return forbidden()
  const { sessionId } = await params

  const session = await ownedSession(sessionId, user.id)
  if (!session) return Response.json({ error: 'جلسه یافت نشد' }, { status: 404 })

  const { title, weekNumber, dayNumber, dayLabel, focus, notes, scheduledDate } = await req.json()
  const updated = await db.workoutSession.update({
    where: { id: sessionId },
    data: {
      title: title?.trim() ?? session.title,
      weekNumber: weekNumber ? parseInt(weekNumber) : session.weekNumber,
      dayNumber: dayNumber ? parseInt(dayNumber) : session.dayNumber,
      dayLabel: dayLabel ?? session.dayLabel,
      focus: focus ?? session.focus,
      notes: notes ?? session.notes,
      scheduledDate: scheduledDate ?? session.scheduledDate,
    },
  })
  return Response.json({ session: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'COACH') return forbidden()
  const { sessionId } = await params

  const session = await ownedSession(sessionId, user.id)
  if (!session) return Response.json({ error: 'جلسه یافت نشد' }, { status: 404 })

  await db.sessionExercise.deleteMany({ where: { sessionId } })
  await db.workoutLog.updateMany({ where: { sessionId }, data: { sessionId: null } })
  await db.workoutSession.delete({ where: { id: sessionId } })
  return Response.json({ ok: true })
}
