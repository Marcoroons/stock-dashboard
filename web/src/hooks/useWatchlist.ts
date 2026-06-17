import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Watchlist, WatchlistItem } from '@/types/database'

export type { Watchlist, WatchlistItem }

export function useWatchlist() {
  const { user } = useAuth()
  const [watchlist, setWatchlist] = useState<Watchlist | null>(null)
  const [items, setItems] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(true)

  const ensureWatchlist = useCallback(async (userId: string): Promise<Watchlist | null> => {
    const { data: existing } = await supabase
      .from('watchlists')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (existing) return existing

    const { data: created } = await supabase
      .from('watchlists')
      .insert({ user_id: userId, name: 'My Watchlist' })
      .select()
      .single()

    return created ?? null
  }, [])

  const refresh = useCallback(async () => {
    if (!user) { setLoading(false); return }
    setLoading(true)

    const wl = await ensureWatchlist(user.id)
    if (!wl) { setLoading(false); return }
    setWatchlist(wl)

    const { data } = await supabase
      .from('watchlist_items')
      .select('*')
      .eq('watchlist_id', wl.id)
      .order('added_at', { ascending: false })

    setItems(data ?? [])
    setLoading(false)
  }, [user?.id, ensureWatchlist])

  useEffect(() => { refresh() }, [refresh])

  const addItem = useCallback(async (
    ticker: string,
    name?: string,
  ): Promise<{ error: string | null }> => {
    if (!watchlist || !user) return { error: 'Not ready' }

    const upperTicker = ticker.toUpperCase()
    if (items.some(i => i.ticker === upperTicker)) return { error: 'Already in watchlist' }

    const { data, error } = await supabase
      .from('watchlist_items')
      .insert({
        watchlist_id: watchlist.id,
        user_id: user.id,
        ticker: upperTicker,
        name: name ?? null,
        added_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) return { error: error.message }
    setItems(prev => [data, ...prev])
    return { error: null }
  }, [watchlist, items, user?.id])

  const removeItem = useCallback(async (id: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.from('watchlist_items').delete().eq('id', id)
    if (error) return { error: error.message }
    setItems(prev => prev.filter(i => i.id !== id))
    return { error: null }
  }, [])

  return { watchlist, items, loading, addItem, removeItem, refresh }
}
