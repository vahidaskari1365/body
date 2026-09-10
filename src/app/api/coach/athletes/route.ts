import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUserFromRequest, unauthorized, forbidden, hashPassword } from '@/lib/auth'

// GET list of athletes of this coach
export async function GET(req: NextRequest) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'COACH') return forbidden()

  const athletes = await db.user.findMany({
    where: { role: 'ATHLETE', athleteProfile: { coachId: user.id } },
    include: {
      athleteProfile: true,
      programAssignments: {
        where: { status: 'ACTIVE' },
        include: { program: { select: { id: true, title: true } } },
      },
      workoutLogs: { orderBy: { date: 'desc' }, take: 5 },
      progressEntries: { orderBy: { date: 'desc' }, take: 1 },
    },
  })

  const athletesWithStats = await Promise.all(
    athletes.map(async (a) => {
      const totalLogs = await db.workoutLog.count({ where: { athleteId: a.id } })
      const completedLogs = await db.workoutLog.count({ where: { athleteId: a.id, status: 'COMPLETED' } })
      return {
        id: a.id,
        name: a.name,
        email: a.email,
        phone: a.phone,
        profile: a.athleteProfile,
        activePrograms: a.programAssignments.map((pa) => pa.program),
        latestWeight: a.progressEntries[0]?.weight ?? a.athleteProfile?.weight ?? null,
        adherence: totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : null,
        recentLogs: a.workoutLogs.length,
        createdAt: a.createdAt,
      }
    })
  )
  return Response.json({ athletes: athletesWithStats })
}

// POST create new athlete (coach creates account + profile)
export async function POST(req: NextRequest) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'COACH') return forbidden()

  const body = await req.json()
  const { name, email, password, phone, height, weight, sport, goal, level, birthDate, medicalNotes } = body
  if (!name || !email || !password) {
    return Response.json({ error: 'نام، ایمیل و رمز عبور الزامی است' }, { status: 400 })
  }
  const exists = await db.user.findUnique({ where: { email: email.trim().toLowerCase() } })
  if (exists) return Response.json({ error: 'این ایمیل قبلاً ثبت شده است' }, { status: 409 })

  const athlete = await db.user.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashPassword(password),
      role: 'ATHLETE',
      phone: phone || null,
      athleteProfile: {
        create: {
          coachId: user.id,
          height: height ? parseFloat(height) : null,
          weight: weight ? parseFloat(weight) : null,
          sport: sport || null,
          goal: goal || null,
          level: level || null,
          birthDate: birthDate || null,
          medicalNotes: medicalNotes || null,
        },
      },
    },
    include: { athleteProfile: true },
  })
  return Response.json({ athlete: { id: athlete.id, name: athlete.name, email: athlete.email } }, { status: 201 })
}
