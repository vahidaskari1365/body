import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUserFromRequest, unauthorized, forbidden } from '@/lib/auth'

// GET athlete dashboard
export async function GET(req: NextRequest) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'ATHLETE') return forbidden()

  const assignments = await db.programAssignment.findMany({
    where: { athleteId: user.id, status: 'ACTIVE' },
    include: { program: true },
  })

  const totalLogs = await db.workoutLog.count({ where: { athleteId: user.id } })
  const completedLogs = await db.workoutLog.count({ where: { athleteId: user.id, status: 'COMPLETED' } })
  const progress = await db.progressEntry.findMany({ where: { athleteId: user.id }, orderBy: { date: 'asc' } })

  // this week sessions
  const activePrograms = assignments.map((a) => a.program)
  const weekSessions = await db.workoutSession.findMany({
    where: { programId: { in: activePrograms.map((p) => p.id) }, weekNumber: 1 },
    orderBy: { dayNumber: 'asc' },
    include: { exercises: { include: { exercise: true } } },
  })

  const unreadMessages = await db.message.count({ where: { receiverId: user.id, readAt: null } })
  const coach = await db.athleteProfile.findUnique({
    where: { userId: user.id },
    include: { coach: { select: { id: true, name: true, email: true } } },
  })

  // recent logs
  const recentLogs = await db.workoutLog.findMany({
    where: { athleteId: user.id },
    orderBy: { date: 'desc' },
    take: 5,
    include: { session: { select: { title: true } } },
  })

  return Response.json({
    stats: {
      activePrograms: activePrograms.length,
      totalLogs,
      completedLogs,
      adherence: totalLogs ? Math.round((completedLogs / totalLogs) * 100) : 0,
      unreadMessages,
      currentWeight: progress.length ? progress[progress.length - 1].weight : null,
    },
    programs: activePrograms,
    recentLogs,
    progress,
    coach: coach?.coach || null,
  })
}
