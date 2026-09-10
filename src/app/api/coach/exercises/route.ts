import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUserFromRequest, unauthorized, forbidden } from '@/lib/auth'

// GET all exercises of coach (searchable)
export async function GET(req: NextRequest) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'COACH') return forbidden()

  const q = req.nextUrl.searchParams.get('q') || ''
  const category = req.nextUrl.searchParams.get('category') || ''
  const exercises = await db.exercise.findMany({
    where: {
      coachId: user.id,
      ...(q ? { name: { contains: q } } : {}),
      ...(category ? { category } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { sessionExercises: true } } },
  })
  return Response.json({ exercises })
}

// POST create exercise
export async function POST(req: NextRequest) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'COACH') return forbidden()

  const body = await req.json()
  const { name, category, muscleGroups, equipment, description, instructions, videoUrl } = body
  if (!name || !category) {
    return Response.json({ error: 'نام حرکت و دسته‌بندی الزامی است' }, { status: 400 })
  }
  const exercise = await db.exercise.create({
    data: {
      coachId: user.id,
      name: name.trim(),
      category,
      muscleGroups: muscleGroups || null,
      equipment: equipment || null,
      description: description || null,
      instructions: instructions || null,
      videoUrl: videoUrl || null,
    },
  })
  return Response.json({ exercise }, { status: 201 })
}
