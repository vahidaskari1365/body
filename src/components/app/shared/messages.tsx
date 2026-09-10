'use client'

import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { api, useFetch, toFa, faTime } from '@/lib/client'
import { Send, MessageCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Conversation {
  id: string
  name: string
  role: string
  lastMessage?: { content: string; createdAt: string; senderId: string } | null
  unread: number
}

interface Msg {
  id: string
  senderId: string
  receiverId: string
  content: string
  createdAt: string
}

export function MessagesView({ userId, fixedPeerId }: { userId: string; fixedPeerId?: string }) {
  const [peerId, setPeerId] = useState<string | null>(fixedPeerId || null)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const convs = useFetch<{ conversations: Conversation[] }>(!fixedPeerId ? '/api/messages' : null, [])
  const thread = useFetch<{ messages: Msg[] }>(peerId ? `/api/messages?peerId=${peerId}` : null, [])

  // polling for new messages
  useEffect(() => {
    if (!peerId) return
    const t = setInterval(() => thread.refresh(), 6000)
    return () => clearInterval(t)
  }, [peerId, thread.refresh])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread.data])

  async function send() {
    if (!draft.trim() || !peerId) return
    setSending(true)
    try {
      await api('/api/messages', { method: 'POST', body: { receiverId: peerId, content: draft } })
      setDraft('')
      thread.refresh()
      convs.refresh()
    } catch (e) {
      toast({ title: 'خطا در ارسال', description: e instanceof Error ? e.message : '', variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  const conversations = convs.data?.conversations || []

  // fixed peer mode (athlete <-> coach direct chat)
  if (fixedPeerId && peerId) {
    return <ThreadView thread={thread} draft={draft} setDraft={setDraft} send={send} sending={sending} userId={userId} bottomRef={bottomRef} />
  }

  const active = conversations.find((c) => c.id === peerId)

  return (
    <div className="flex h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)]">
      {/* conversations list */}
      <div className={cn('w-full md:w-80 shrink-0 border-l bg-card overflow-y-auto', peerId && 'hidden md:block')}>
        <div className="p-4 border-b sticky top-0 bg-card z-10">
          <h2 className="font-bold">گفتگوها</h2>
        </div>
        {convs.loading ? (
          <div className="p-4 space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)}</div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
            هنوز گفتگویی ندارید
          </div>
        ) : (
          conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setPeerId(c.id)}
              className={cn(
                'w-full flex items-center gap-3 p-3.5 text-right border-b hover:bg-accent/60 transition-colors',
                peerId === c.id && 'bg-accent'
              )}
            >
              <Avatar className="w-10 h-10">
                <AvatarFallback className={cn('font-bold', c.role === 'COACH' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800')}>
                  {c.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm truncate">{c.name}</span>
                  {c.lastMessage && <span className="text-[10px] text-muted-foreground shrink-0">{faTime(c.lastMessage.createdAt)}</span>}
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p className="text-xs text-muted-foreground truncate">
                    {c.lastMessage ? `${c.lastMessage.senderId === userId ? 'شما: ' : ''}${c.lastMessage.content}` : 'شروع گفتگو'}
                  </p>
                  {c.unread > 0 && (
                    <span className="min-w-5 h-5 px-1.5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {toFa(c.unread)}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* thread */}
      {peerId && active ? (
        <ThreadView
          thread={thread}
          draft={draft}
          setDraft={setDraft}
          send={send}
          sending={sending}
          userId={userId}
          bottomRef={bottomRef}
          title={active.name}
          onBack={() => setPeerId(null)}
        />
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-muted-foreground">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">یک گفتگو را انتخاب کنید</p>
          </div>
        </div>
      )}
    </div>
  )
}

function ThreadView({
  thread,
  draft,
  setDraft,
  send,
  sending,
  userId,
  bottomRef,
  title,
  onBack,
}: {
  thread: { data: { messages: Msg[] } | null; loading: boolean }
  draft: string
  setDraft: (v: string) => void
  send: () => void
  sending: boolean
  userId: string
  bottomRef: React.RefObject<HTMLDivElement | null>
  title?: string
  onBack?: () => void
}) {
  const messages = thread.data?.messages || []
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-background">
      {title && (
        <div className="flex items-center gap-3 p-3.5 border-b bg-card md:hidden">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              برگشت
            </Button>
          )}
          <span className="font-bold">{title}</span>
        </div>
      )}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2.5 max-w-2xl mx-auto pb-2">
          {thread.loading && messages.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">در حال بارگذاری...</div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={cn('flex', m.senderId === userId ? 'justify-start' : 'justify-end')}>
              <div
                className={cn(
                  'max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm',
                  m.senderId === userId
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-muted rounded-tl-sm'
                )}
              >
                <p className="whitespace-pre-wrap break-words">{m.content}</p>
                <p className={cn('text-[10px] mt-1', m.senderId === userId ? 'text-white/70' : 'text-muted-foreground')}>
                  {faTime(m.createdAt)}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      <div className="p-3.5 border-t bg-card">
        <form
          className="flex gap-2 max-w-2xl mx-auto"
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
        >
          <Input
            placeholder="پیام خود را بنویسید..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={sending || !draft.trim()} aria-label="ارسال">
            <Send className="w-4 h-4 -scale-x-100" />
          </Button>
        </form>
      </div>
    </div>
  )
}
