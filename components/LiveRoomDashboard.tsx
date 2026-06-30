'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Users, MessageSquare, CheckCircle2 } from 'lucide-react'

type PresenceState = {
  user_id: string
  name: string
  status: 'working' | 'done'
}

type ChatMessage = {
  id: string
  user_id: string
  name: string
  text: string
  timestamp: string
}

export default function LiveRoomDashboard({ 
  sessionId, 
  currentUserId,
  currentUserName,
  initialGoals,
}: { 
  sessionId: string
  currentUserId: string
  currentUserName: string
  initialGoals: any[]
}) {
  const [presence, setPresence] = useState<Record<string, PresenceState>>({})
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [goals, setGoals] = useState(initialGoals)
  const chatRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const channelRef = useRef<any>(null)

  useEffect(() => {
    const channel = supabase.channel(`session_${sessionId}`, {
      config: {
        presence: { key: currentUserId },
        broadcast: { self: true }
      }
    })

    channelRef.current = channel

    // 1. Presence
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      const newPresence: Record<string, PresenceState> = {}
      for (const [key, presences] of Object.entries(state)) {
        if (presences.length > 0) {
          newPresence[key] = presences[0] as unknown as PresenceState
        }
      }
      setPresence(newPresence)
    })

    // 2. Broadcast (Ephemeral Chat)
    channel.on('broadcast', { event: 'chat' }, ({ payload }) => {
      setMessages(prev => [...prev, payload as ChatMessage])
      setTimeout(() => {
        if (chatRef.current) {
          chatRef.current.scrollTop = chatRef.current.scrollHeight
        }
      }, 50)
    })

    // 3. Postgres Changes (Goals completing)
    channel.on('postgres_changes', { 
      event: 'UPDATE', 
      schema: 'public', 
      table: 'goals',
      filter: `session_id=eq.${sessionId}`
    }, (payload) => {
      setGoals(prev => prev.map(g => g.id === payload.new.id ? payload.new : g))
    })

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        const myGoal = goals.find(g => g.user_id === currentUserId)
        await channel.track({
          user_id: currentUserId,
          name: currentUserName,
          status: myGoal?.completed ? 'done' : 'working'
        })
      }
    })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId, currentUserId, currentUserName, supabase])

  const sendChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !channelRef.current) return

    const msg: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      user_id: currentUserId,
      name: currentUserName,
      text: chatInput.trim(),
      timestamp: new Date().toISOString()
    }

    channelRef.current.send({
      type: 'broadcast',
      event: 'chat',
      payload: msg
    })

    setChatInput('')
  }

  const activeUsersCount = Object.keys(presence).length
  const completedCount = goals.filter(g => g.completed).length
  const progressPct = goals.length > 0 ? (completedCount / goals.length) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Group Progress Bar */}
      <div className="p-4 rounded-2xl depth-out" style={{ background: 'var(--surface)' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            <Users size={16} style={{ color: 'var(--accent)' }} /> 
            Community Progress
          </div>
          <div className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
            {completedCount} / {goals.length} Check-ins
          </div>
        </div>
        <div className="h-4 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
          <div 
            className="h-full transition-all duration-1000 ease-out relative"
            style={{ 
              width: `${progressPct}%`, 
              background: 'linear-gradient(90deg, var(--accent-dim), var(--accent))'
            }}
          >
            <div className="absolute inset-0 opacity-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] bg-repeat" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Presence Grid */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--accent)' }}></span>
              <span className="relative inline-flex rounded-full h-3 w-3" style={{ background: 'var(--accent)' }}></span>
            </span>
            Live Now ({activeUsersCount})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.values(presence).map(p => {
              const userGoal = goals.find(g => g.user_id === p.user_id)
              const isMe = p.user_id === currentUserId
              return (
                <div key={p.user_id} className="p-4 rounded-xl flex items-center gap-4 depth-out transition-all" style={{ background: 'var(--surface-2)', border: isMe ? '1px solid var(--accent)' : '1px solid var(--border)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg uppercase shadow-inner" style={{ background: userGoal?.completed ? 'var(--success)' : 'var(--accent-dim)', color: userGoal?.completed ? 'white' : 'var(--accent)' }}>
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                      {p.name} {isMe && '(You)'}
                    </p>
                    {userGoal ? (
                      <p className="text-xs truncate mt-0.5" style={{ color: userGoal.completed ? 'var(--success)' : 'var(--text-secondary)' }}>
                        {userGoal.completed ? '✓ Checked in' : `Target: ${userGoal.target_amount} ${userGoal.target_unit}`}
                      </p>
                    ) : (
                      <p className="text-xs text-neutral-500">Setting goal...</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Ephemeral Chat */}
        <div className="flex flex-col rounded-2xl depth-out h-[400px]" style={{ background: 'var(--surface)' }}>
          <div className="p-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
            <MessageSquare size={16} style={{ color: 'var(--accent)' }} />
            <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Cheer Box</h3>
          </div>
          
          <div ref={chatRef} className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                <MessageSquare size={24} className="mb-2" style={{ color: 'var(--text-muted)' }} />
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Messages disappear when<br/>the session ends.</p>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.user_id === currentUserId ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>{msg.name}</span>
                  <div className="px-3 py-2 rounded-2xl text-sm" 
                    style={{ 
                      background: msg.user_id === currentUserId ? 'var(--accent)' : 'var(--surface-3)',
                      color: msg.user_id === currentUserId ? 'white' : 'var(--text-primary)',
                      borderBottomRightRadius: msg.user_id === currentUserId ? '4px' : '16px',
                      borderBottomLeftRadius: msg.user_id === currentUserId ? '16px' : '4px',
                    }}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <form onSubmit={sendChat} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Say hello!"
                className="flex-1 bg-transparent text-sm px-3 py-2 rounded-xl border focus:outline-none focus:border-[var(--accent)]"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                maxLength={100}
              />
              <button 
                type="submit" 
                disabled={!chatInput.trim()}
                className="p-2 rounded-xl transition-all disabled:opacity-50"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
