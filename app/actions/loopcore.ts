'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createRoom(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const name = formData.get('name') as string
  const description = formData.get('description') as string | null
  const room_type = (formData.get('room_type') as string) || 'writing_sprint'
  const visibility = (formData.get('visibility') as string) || 'public'

  const { data: room, error } = await supabase
    .from('rooms')
    .insert({
      name,
      description,
      room_type,
      host_user_id: user.id,
      visibility,
      ai_host_enabled: true
    })
    .select()
    .single()

  if (error) throw error

  // Add creator as owner
  await supabase.from('room_members').insert({
    room_id: room.id,
    user_id: user.id,
    role: 'owner'
  })

  redirect(`/rooms/${room.id}`)
}

export async function joinRoom(roomId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('room_members').insert({
    room_id: roomId,
    user_id: user.id,
    role: 'member'
  })

  // Ignore unique constraint error if already joined
  if (error && error.code !== '23505') {
    throw error
  }

  revalidatePath(`/rooms/${roomId}`)
  redirect(`/rooms/${roomId}`)
}

export async function scheduleSession(roomId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const session_type = (formData.get('session_type') as string) || 'writing_sprint'
  const duration_minutes = parseInt(formData.get('duration_minutes') as string || '25')

  const { data: session, error } = await supabase
    .from('sessions')
    .insert({
      room_id: roomId,
      host_user_id: user.id,
      title,
      session_type,
      duration_minutes,
      status: 'scheduled'
    })
    .select()
    .single()

  if (error) throw error

  // Log event
  await supabase.from('events').insert({
    user_id: user.id,
    room_id: roomId,
    session_id: session.id,
    event_type: 'session_scheduled',
    event_payload: { duration_minutes, session_type }
  })

  redirect(`/sessions/${session.id}`)
}

export async function joinSessionAndSetGoal(sessionId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const target_amount = parseInt(formData.get('target_amount') as string)
  const target_unit = formData.get('target_unit') as string
  const goal_type = formData.get('goal_type') as string

  // 1. Join session
  const { error: joinError } = await supabase.from('session_participants').insert({
    session_id: sessionId,
    user_id: user.id
  })
  
  if (joinError && joinError.code !== '23505') throw joinError

  // 2. Set Goal
  const { error: goalError } = await supabase.from('goals').insert({
    session_id: sessionId,
    user_id: user.id,
    goal_type,
    target_amount,
    target_unit
  })

  if (goalError) throw goalError

  // 3. Log event
  await supabase.from('events').insert({
    user_id: user.id,
    session_id: sessionId,
    event_type: 'goal_created',
    event_payload: { target_amount, target_unit, goal_type }
  })

  redirect(`/sessions/${sessionId}/live`)
}

export async function startLiveSession(sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Check if host
  const { data: session } = await supabase.from('sessions').select('host_user_id').eq('id', sessionId).single()
  if (session?.host_user_id === user.id) {
    await supabase.from('sessions').update({ status: 'live', start_time: new Date().toISOString() }).eq('id', sessionId)
  }
  
  revalidatePath(`/sessions/${sessionId}/live`)
}

export async function checkInSession(sessionId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const actual_amount = parseInt(formData.get('actual_amount') as string)
  const focus_rating = parseInt(formData.get('focus_rating') as string)
  const reflection = formData.get('reflection') as string

  // 1. Update Goal
  const { data: goal } = await supabase.from('goals').select('id, target_amount').eq('session_id', sessionId).eq('user_id', user.id).single()
  
  if (goal) {
    await supabase.from('goals').update({
      actual_amount,
      completed: actual_amount >= goal.target_amount
    }).eq('id', goal.id)
  }

  // 2. Update Participant
  await supabase.from('session_participants').update({
    left_at: new Date().toISOString(),
    completed_session: true,
    focus_rating,
    reflection
  }).eq('session_id', sessionId).eq('user_id', user.id)

  // 3. Log event for LoopCore
  await supabase.from('events').insert({
    user_id: user.id,
    session_id: sessionId,
    event_type: 'session_completed',
    event_payload: { actual_amount, focus_rating, completed: goal ? actual_amount >= goal.target_amount : false }
  })

  redirect(`/sessions/${sessionId}/summary`)
}
