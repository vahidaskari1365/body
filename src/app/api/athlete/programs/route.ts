import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUserFromRequest, unauthorized, forbidden } from '@/lib/auth'

// GET athlete's assigned programs with full sessions + exercises
export async function GET(req: NextRequest) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'ATHLETE') return forbidden()

  const assignments = await db.programAssignment.findMany({
    where: { athleteId: user.id, status: { in: ['ACTIVE', 'COMPLETED'] } },
    orderBy: { createdAt: 'desc' },
    include: {
      program: {
        include: {
          coach: { select: { name: true } },
          sessions: {
            orderBy: [{ weekNumber: 'asc' }, { dayNumber: 'asc' }],
            include: {
              exercises: { orderBy: { order: 'asc' }, include: { exercise: true } },
              logs: { where: { athleteId: user.id }, select: { id: true, status: true, date: true } },
            },
          },
        },
      },
    },
  })
  return Response.json({ assignments })
}
