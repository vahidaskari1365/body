import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUserFromRequest, unauthorized, forbidden } from '@/lib/auth'

// GET progress entries / POST new measurement
export async function GET(req: NextRequest) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'ATHLETE') return forbidden()

  const entries = await db.progressEntry.findMany({
    where: { athleteId: user.id },
    orderBy: { date: 'asc' },
  })
  return Response.json({ entries })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'ATHLETE') return forbidden()

  const { weight, bodyFat, muscleMass, notes, date } = await req.json()
  if (weight === undefined || weight === null || weight === '') {
    return Response.json({ error: 'ثبت وزن الزامی است' }, { status: 400 })
  }
  const entry = await db.progressEntry.create({
    data: {
      athleteId: user.id,
      weight: parseFloat(weight),
      bodyFat: bodyFat ? parseFloat(bodyFat) : null,
      muscleMass: muscleMass ? parseFloat(muscleMass) : null,
      notes: notes || null,
      date: date ? new Date(date) : new Date(),
    },
  })
  return Response.json({ entry }, { status: 201 })
}
