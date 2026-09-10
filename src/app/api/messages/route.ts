import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUserFromRequest, unauthorized } from '@/lib/auth'

// GET conversations list or messages with a peer (?peerId=)
export async function GET(req: NextRequest) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()

  const peerId = req.nextUrl.searchParams.get('peerId')
  if (!peerId) {
    // conversations = users this user has chatted with + linked counterparties
    const sent = await db.message.findMany({ where: { senderId: user.id }, select: { receiverId: true } })
    const received = await db.message.findMany({ where: { receiverId: user.id }, select: { senderId: true } })
    const ids = new Set<string>()
    sent.forEach((m) => ids.add(m.receiverId))
    received.forEach((m) => ids.add(m.senderId))

    // add linked users (coach of athlete / athletes of coach)
    if (user.role === 'COACH') {
      const athletes = await db.user.findMany({
        where: { role: 'ATHLETE', athleteProfile: { coachId: user.id } },
        select: { id: true },
      })
      athletes.forEach((a) => ids.add(a.id))
    } else {
      const profile = await db.athleteProfile.findUnique({ where: { userId: user.id } })
      if (profile?.coachId) ids.add(profile.coachId)
    }

    const peers = await db.user.findMany({
      where: { id: { in: Array.from(ids) } },
      select: { id: true, name: true, role: true },
    })

    const lastMessages = await Promise.all(
      peers.map(async (p) => {
        const last = await db.message.findFirst({
          where: { OR: [{ senderId: user.id, receiverId: p.id }, { senderId: p.id, receiverId: user.id }] },
          orderBy: { createdAt: 'desc' },
        })
        const unread = await db.message.count({
          where: { senderId: p.id, receiverId: user.id, readAt: null },
        })
        return { ...p, lastMessage: last, unread }
      })
    )
    lastMessages.sort((a, b) => {
      const ta = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0
      const tb = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0
      return tb - ta
    })
    return Response.json({ conversations: lastMessages })
  }

  const messages = await db.message.findMany({
    where: {
      OR: [
        { senderId: user.id, receiverId: peerId },
        { senderId: peerId, receiverId: user.id },
      ],
    },
    orderBy: { createdAt: 'asc' },
    take: 200,
  })
  // mark received as read
  await db.message.updateMany({
    where: { senderId: peerId, receiverId: user.id, readAt: null },
    data: { readAt: new Date() },
  })
  return Response.json({ messages })
}

// POST send message
export async function POST(req: NextRequest) {
  const user = await getSessionUserFromRequest(req)
  if (!user) return unauthorized()

  const { receiverId, content } = await req.json()
  if (!receiverId || !content?.trim()) {
    return Response.json({ error: 'متن پیام الزامی است' }, { status: 400 })
  }
  const receiver = await db.user.findUnique({ where: { id: receiverId } })
  if (!receiver) return Response.json({ error: 'گیرنده یافت نشد' }, { status: 404 })

  const message = await db.message.create({
    data: { senderId: user.id, receiverId, content: content.trim() },
  })
  return Response.json({ message }, { status: 201 })
}
