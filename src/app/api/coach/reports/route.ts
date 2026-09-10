import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUserFromRequest, unauthorized, forbidden } from '@/lib/auth'

// GET coach reports: per-athlete adherence + volume stats
export async function GET(req: NextRequest) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'COACH') return forbidden()

  const athletes = await db.user.findMany({
    where: { role: 'ATHLETE', athleteProfile: { coachId: user.id } },
    include: {
      workoutLogs: { orderBy: { date: 'asc' }, include: { exerciseLogs: true, session: { select: { title: true } } } },
      progressEntries: { orderBy: { date: 'asc' } },
      programAssignments: { where: { status: 'ACTIVE' }, include: { program: { select: { title: true } } } },
    },
  })

  const report = athletes.map((a) => {
    const total = a.workoutLogs.length
    const completed = a.workoutLogs.filter((l) => l.status === 'COMPLETED').length
    const partial = a.workoutLogs.filter((l) => l.status === 'PARTIAL').length
    const skipped = a.workoutLogs.filter((l) => l.status === 'SKIPPED').length
    const durations = a.workoutLogs.map((l) => l.duration || 0).filter((d) => d > 0)
    const avgDuration = durations.length ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length) : 0
    const ratings = a.workoutLogs.map((l) => l.rating).filter((r): r is number => !!r)
    const avgRating = ratings.length ? (ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1) : null

    // weekly activity last 8 weeks
    const weeks: { week: string; count: number }[] = []
    for (let i = 7; i >= 0; i--) {
      const start = new Date(Date.now() - (i + 1) * 7 * 24 * 3600 * 1000)
      const end = new Date(Date.now() - i * 7 * 24 * 3600 * 1000)
      const count = a.workoutLogs.filter((l) => new Date(l.date) >= start && new Date(l.date) < end).length
      weeks.push({ week: `${i === 0 ? 'این هفته' : `-${i} هفته`}`, count })
    }

    return {
      id: a.id,
      name: a.name,
      activePrograms: a.programAssignments.map((pa) => pa.program.title),
      total,
      completed,
      partial,
      skipped,
      adherence: total ? Math.round((completed / total) * 100) : 0,
      avgDuration,
      avgRating,
      weightTrend: a.progressEntries.map((p) => ({ date: p.date, weight: p.weight })),
      weeklyActivity: weeks,
    }
  })

  return Response.json({ report })
}
