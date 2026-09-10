import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUserFromRequest, unauthorized, forbidden } from '@/lib/auth'

// GET coach dashboard stats
export async function GET(req: NextRequest) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'COACH') return forbidden()

  const [athleteCount, activePrograms, totalExercises, monthPaid, totalPaid, pendingPayments] = await Promise.all([
    db.athleteProfile.count({ where: { coachId: user.id, status: 'ACTIVE' } }),
    db.programAssignment.count({ where: { program: { coachId: user.id }, status: 'ACTIVE' } }),
    db.exercise.count({ where: { coachId: user.id } }),
    db.payment.aggregate({
      where: { coachId: user.id, status: 'PAID', date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
      _sum: { amount: true },
    }),
    db.payment.aggregate({ where: { coachId: user.id, status: 'PAID' }, _sum: { amount: true } }),
    db.payment.count({ where: { coachId: user.id, status: 'PENDING' } }),
  ])

  // workout completion stats last 7 days
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const recentLogs = await db.workoutLog.findMany({
    where: { athlete: { athleteProfile: { coachId: user.id } }, date: { gte: weekAgo } },
    select: { status: true, date: true },
  })

  const unreadMessages = await db.message.count({
    where: { receiverId: user.id, readAt: null },
  })

  // recent activity: latest logs of athletes
  const latestLogs = await db.workoutLog.findMany({
    where: { athlete: { athleteProfile: { coachId: user.id } } },
    orderBy: { date: 'desc' },
    take: 6,
    include: { athlete: { select: { name: true } }, session: { select: { title: true } } },
  })

  // adherence per athlete (for chart)
  const athletes = await db.user.findMany({
    where: { role: 'ATHLETE', athleteProfile: { coachId: user.id } },
    select: { id: true, name: true, workoutLogs: { select: { status: true } } },
  })
  const adherenceChart = athletes.map((a) => {
    const total = a.workoutLogs.length
    const done = a.workoutLogs.filter((l) => l.status === 'COMPLETED').length
    return { name: a.name, value: total ? Math.round((done / total) * 100) : 0 }
  })

  return Response.json({
    stats: {
      athleteCount,
      activePrograms,
      totalExercises,
      monthIncome: monthPaid._sum.amount || 0,
      totalIncome: totalPaid._sum.amount || 0,
      pendingPayments,
      unreadMessages,
      weekLogs: { total: recentLogs.length, completed: recentLogs.filter((l) => l.status === 'COMPLETED').length },
    },
    latestLogs,
    adherenceChart,
  })
}
