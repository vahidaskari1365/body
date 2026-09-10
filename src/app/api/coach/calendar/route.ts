import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUserFromRequest, unauthorized, forbidden } from '@/lib/auth'

// GET all scheduled sessions across coach's programs (for calendar)
export async function GET(req: NextRequest) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'COACH') return forbidden()

  const assignments = await db.programAssignment.findMany({
    where: { program: { coachId: user.id }, status: 'ACTIVE' },
    include: {
      athlete: { select: { name: true } },
      program: { select: { id: true, title: true } },
    },
  })

  const programIds = Array.from(new Set(assignments.map((a) => a.program.id)))
  const sessions = await db.workoutSession.findMany({
    where: { programId: { in: programIds } },
    orderBy: [{ weekNumber: 'asc' }, { dayNumber: 'asc' }],
    include: {
      program: { select: { id: true, title: true } },
      exercises: { include: { exercise: { select: { name: true } } } },
      logs: { select: { athleteId: true, status: true } },
    },
  })

  const sessionsWithAthletes = sessions.map((s) => ({
    ...s,
    athletes: assignments.filter((a) => a.program.id === s.programId).map((a) => a.athlete.name),
  }))

  return Response.json({ sessions: sessionsWithAthletes })
}
