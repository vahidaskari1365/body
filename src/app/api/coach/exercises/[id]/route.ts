import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUserFromRequest, unauthorized, forbidden } from '@/lib/auth'

// PATCH update exercise
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'COACH') return forbidden()
  const { id } = await params

  const body = await req.json()
  const { name, category, muscleGroups, equipment, description, instructions, videoUrl } = body
  const exercise = await db.exercise.findFirst({ where: { id, coachId: user.id } })
  if (!exercise) return Response.json({ error: 'حرکت یافت نشد' }, { status: 404 })

  const updated = await db.exercise.update({
    where: { id },
    data: {
      name: name?.trim() ?? exercise.name,
      category: category ?? exercise.category,
      muscleGroups: muscleGroups ?? exercise.muscleGroups,
      equipment: equipment ?? exercise.equipment,
      description: description ?? exercise.description,
      instructions: instructions ?? exercise.instructions,
      videoUrl: videoUrl ?? exercise.videoUrl,
    },
  })
  return Response.json({ exercise: updated })
}

// DELETE exercise
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'COACH') return forbidden()
  const { id } = await params

  const exercise = await db.exercise.findFirst({ where: { id, coachId: user.id } })
  if (!exercise) return Response.json({ error: 'حرکت یافت نشد' }, { status: 404 })

  // remove references from sessions first
  await db.sessionExercise.deleteMany({ where: { exerciseId: id } })
  await db.exercise.delete({ where: { id } })
  return Response.json({ ok: true })
}
