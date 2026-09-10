import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUserFromRequest, unauthorized, forbidden } from '@/lib/auth'

// POST assign program to one or multiple athletes
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'COACH') return forbidden()
  const { id } = await params

  const { athleteIds, startDate } = await req.json()
  if (!Array.isArray(athleteIds) || athleteIds.length === 0) {
    return Response.json({ error: 'حداقل یک ورزشکار انتخاب کنید' }, { status: 400 })
  }

  const program = await db.program.findFirst({ where: { id, coachId: user.id } })
  if (!program) return Response.json({ error: 'برنامه یافت نشد' }, { status: 404 })

  const created = []
  for (const athleteId of athleteIds) {
    const athlete = await db.user.findFirst({
      where: { id: athleteId, role: 'ATHLETE', athleteProfile: { coachId: user.id } },
    })
    if (!athlete) continue
    // avoid duplicates
    const existing = await db.programAssignment.findFirst({
      where: { programId: id, athleteId, status: 'ACTIVE' },
    })
    if (existing) continue
    const pa = await db.programAssignment.create({
      data: { programId: id, athleteId, startDate: startDate || new Date().toISOString().slice(0, 10) },
      include: { athlete: { select: { name: true } } },
    })
    created.push(pa)
  }

  // publish program if still draft
  if (program.status === 'DRAFT' && created.length > 0) {
    await db.program.update({ where: { id }, data: { status: 'PUBLISHED' } })
  }
  return Response.json({ assigned: created.length }, { status: 201 })
}
