import { supabase } from '@/lib/supabase'
import type { Json } from '@/types/database'

let _userId: string | null = null
let _sessionId: string | null = null

function getSessionId(): string {
  if (!_sessionId) {
    _sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  }
  return _sessionId
}

export function setAnalyticsUserId(userId: string | null) {
  _userId = userId
  if (!userId) _sessionId = null
}

export function track(eventName: string, properties: Record<string, unknown> = {}) {
  if (!_userId) return
  const userId = _userId
  const payload = {
    user_id: userId,
    event_name: eventName,
    properties: properties as unknown as Json,
    session_id: getSessionId(),
  }
  void supabase.from('analytics_events_XYZ').insert([payload])
}
