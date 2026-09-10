import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUserFromRequest, unauthorized } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()
  let athleteProfile = user.athleteProfile
  if (user.role === 'ATHLETE' && !athleteProfile) {
    athleteProfile = await db.athleteProfile.create({ data: { userId: user.id } })
  }
  return Response.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      athleteProfile,
    },
  })
}
