import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUserFromRequest, unauthorized, forbidden } from '@/lib/auth'

// PATCH / DELETE a session-exercise entry
async function ownedSE(id: string, coachId: string) {
  return db.sessionExercise.findFirst({
    where: { id, session: { program: { coachId } } },
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'COACH') return forbidden()
  const { id } = await params

  const se = await ownedSE(id, user.id)
  if (!se) return Response.json({ error: 'آیتم یافت نشد' }, { status: 404 })

  const { sets, reps, weight, restSeconds, notes, order } = await req.json()
  const updated = await db.sessionExercise.update({
    where: { id },
    data: {
      sets: sets !== undefined ? parseInt(sets) : se.sets,
      reps: reps !== undefined ? String(reps) : se.reps,
      weight: weight !== undefined ? (weight ? String(weight) : null) : se.weight,
      restSeconds: restSeconds !== undefined ? parseInt(restSeconds) : se.restSeconds,
      notes: notes ?? se.notes,
      order: order !== undefined ? parseInt(order) : se.order,
    },
    include: { exercise: true },
  })
  return Response.json({ sessionExercise: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'COACH') return forbidden()
  const { id } = await params

  const se = await ownedSE(id, user.id)
  if (!se) return Response.json({ error: 'آیتم یافت نشد' }, { status: 404 })

  await db.sessionExercise.delete({ where: { id } })
  return Response.json({ ok: true })
}
