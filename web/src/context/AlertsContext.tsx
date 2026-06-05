import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { generateAlerts, countAlerts, type AlertType } from '@/lib/alert-engine'
import { MOCK_HOLDINGS, MOCK_PORTFOLIO, MOCK_NEWS } from '@/data/mock'
import { toDnaInput } from '@/lib/utils'

export interface PersistedAlert {
  id: string
  user_id: string
  type: AlertType
  priority: 'critical' | 'warning' | 'info' | 'positive'
  title: string
  body: string
  meta: Record<string, unknown>
  read: boolean
  dismissed: boolean
  generated_at: string
  created_at: string
}

interface AlertsContextValue {
  alerts: PersistedAlert[]
  unreadCount: number
  loading: boolean
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  dismiss: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

const AlertsContext = createContext<AlertsContextValue | null>(null)

const db = supabase as any
const STALE_HOURS = 6

export function AlertsProvider({ children }: { children: ReactNode }) {
  const { user, dna } = useAuth()
  const [alerts, setAlerts] = useState<PersistedAlert[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) { setAlerts([]); setLoading(false); return }
    const { data } = await db
      .from('portfolio_alerts')
      .select('*')
      .eq('user_id', user.id)
      .eq('dismissed', false)
      .order('created_at', { ascending: false })
    const existing: PersistedAlert[] = data ?? []

    // Determine if a refresh is needed
    const mostRecent = existing[0]
    const staleMs = STALE_HOURS * 60 * 60 * 1000
    const needsRefresh = !mostRecent || (Date.now() - new Date(mostRecent.generated_at).getTime()) > staleMs

    if (needsRefresh) {
      // Fetch goals from supabase
      const { data: goalsData } = await db
        .from('financial_goals')
        .select('*')
        .eq('user_id', user.id)
      const goals = goalsData ?? []

      // Generate fresh alerts
      const generated = generateAlerts({
        holdings: MOCK_HOLDINGS,
        portfolio: MOCK_PORTFOLIO,
        dna: dna ? toDnaInput(dna) : null,
        news: MOCK_NEWS as any,
        goals,
      })

      // Delete old alerts and insert new ones
      await db.from('portfolio_alerts').delete().eq('user_id', user.id)

      if (generated.length > 0) {
        const rows = generated.map(a => ({
          user_id: user.id,
          type: a.type,
          priority: a.priority,
          title: a.title,
          body: a.body,
          meta: a.meta,
        }))
        const { data: inserted } = await db.from('portfolio_alerts').insert(rows).select()
        setAlerts(inserted ?? [])
      } else {
        setAlerts([])
      }
    } else {
      setAlerts(existing)
    }
    setLoading(false)
  }, [user, dna])

  useEffect(() => { load() }, [load])

  async function markRead(id: string) {
    await db.from('portfolio_alerts').update({ read: true }).eq('id', id)
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a))
  }

  async function markAllRead() {
    if (!user) return
    await db.from('portfolio_alerts').update({ read: true }).eq('user_id', user.id)
    setAlerts(prev => prev.map(a => ({ ...a, read: true })))
  }

  async function dismiss(id: string) {
    await db.from('portfolio_alerts').update({ dismissed: true }).eq('id', id)
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  const unreadCount = alerts.filter(a => !a.read).length

  return (
    <AlertsContext.Provider value={{ alerts, unreadCount, loading, markRead, markAllRead, dismiss, refresh: load }}>
      {children}
    </AlertsContext.Provider>
  )
}

export function useAlerts() {
  const ctx = useContext(AlertsContext)
  if (!ctx) throw new Error('useAlerts must be used within AlertsProvider')
  return ctx
}

export { countAlerts }
