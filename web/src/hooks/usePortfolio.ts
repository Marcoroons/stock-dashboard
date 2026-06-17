import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Portfolio, Holding } from '@/types/database'

export type { Portfolio, Holding }

export interface DisplayHolding extends Holding {
  costBasis: number      // alias for cost_basis (camelCase for UI)
  currentPrice: number   // from live quote or cost_basis fallback
  dayChange: number | null
  weight: number         // % of total portfolio value
}

export function usePortfolio() {
  const { user } = useAuth()
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const ensurePortfolio = useCallback(async (userId: string): Promise<Portfolio | null> => {
    const { data: existing } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .maybeSingle()

    if (existing) return existing

    const { data: created, error: err } = await supabase
      .from('portfolios')
      .insert({ user_id: userId, name: 'My Portfolio', currency: 'USD', is_default: true })
      .select()
      .single()

    if (err) return null
    return created
  }, [])

  const refresh = useCallback(async () => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    setError(null)

    const p = await ensurePortfolio(user.id)
    if (!p) { setLoading(false); setError('Failed to load portfolio'); return }
    setPortfolio(p)

    const { data, error: fetchErr } = await supabase
      .from('holdings')
      .select('*')
      .eq('portfolio_id', p.id)
      .order('created_at', { ascending: false })

    if (fetchErr) setError(fetchErr.message)
    else setHoldings(data ?? [])
    setLoading(false)
  }, [user?.id, ensurePortfolio])

  useEffect(() => { refresh() }, [refresh])

  const addHolding = useCallback(async (
    ticker: string,
    shares: number,
    costBasis: number,
  ): Promise<{ error: string | null }> => {
    if (!portfolio || !user) return { error: 'Not ready' }

    const upperTicker = ticker.toUpperCase()
    const existing = holdings.find(h => h.ticker === upperTicker)

    if (existing) {
      // Average down/up: weighted average cost basis
      const newShares = existing.shares + shares
      const newCost = (existing.shares * existing.cost_basis + shares * costBasis) / newShares
      const { data, error } = await supabase
        .from('holdings')
        .update({ shares: newShares, cost_basis: newCost, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()
      if (error) return { error: error.message }
      setHoldings(prev => prev.map(h => h.id === existing.id ? data : h))
    } else {
      const { data, error } = await supabase
        .from('holdings')
        .insert({
          portfolio_id: portfolio.id,
          user_id: user.id,
          ticker: upperTicker,
          asset_type: 'stock',
          shares,
          cost_basis: costBasis,
        })
        .select()
        .single()
      if (error) return { error: error.message }
      setHoldings(prev => [data, ...prev])
    }

    return { error: null }
  }, [portfolio, user?.id, holdings])

  const deleteHolding = useCallback(async (id: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.from('holdings').delete().eq('id', id)
    if (error) return { error: error.message }
    setHoldings(prev => prev.filter(h => h.id !== id))
    return { error: null }
  }, [])

  return { portfolio, holdings, loading, error, addHolding, deleteHolding, refresh }
}
