/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabase'
import type { Portfolio, ServiceResponse, PaginatedResponse } from '@/types/services'

const db = supabase as any

export const PortfolioService = {
  async getPortfolios(userId: string) {
    try {
      const { data, error } = await db.from('portfolios').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      if (error) throw error
      return { data: data || [], error: null, success: true } as ServiceResponse<Portfolio[]>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<Portfolio[]>
    }
  },

  async getPortfolioById(portfolioId: string) {
    try {
      const { data, error } = await db.from('portfolios').select('*').eq('id', portfolioId).maybeSingle()
      if (error) throw error
      return { data, error: null, success: !!data } as ServiceResponse<Portfolio>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<Portfolio>
    }
  },

  async createPortfolio(userId: string, portfolio: Omit<Portfolio, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await db
        .from('portfolios')
        .insert({ user_id: userId, name: portfolio.name, description: portfolio.description, currency: portfolio.currency || 'USD', is_default: false })
        .select()
        .single()
      if (error) throw error
      return { data, error: null, success: true } as ServiceResponse<Portfolio>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<Portfolio>
    }
  },

  async updatePortfolio(portfolioId: string, updates: Partial<Portfolio>) {
    try {
      const { data, error } = await db.from('portfolios').update(updates).eq('id', portfolioId).select().single()
      if (error) throw error
      return { data, error: null, success: true } as ServiceResponse<Portfolio>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<Portfolio>
    }
  },

  async getHoldings(portfolioId: string, limit?: number, offset?: number) {
    try {
      let query = db.from('holdings').select('*', { count: 'exact' }).eq('portfolio_id', portfolioId).order('created_at', { ascending: false })
      if (limit) query = query.limit(limit)
      if (offset) query = query.range(offset, offset + (limit || 10) - 1)
      const { data, error, count } = await query
      if (error) throw error
      return {
        data: { data: data || [], total: count || 0, page: offset && limit ? offset / limit + 1 : 1, limit: limit || 10, total_pages: count && limit ? Math.ceil(count / limit) : 1 },
        error: null,
        success: true,
      } as ServiceResponse<PaginatedResponse<any>>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<PaginatedResponse<any>>
    }
  },

  async addHolding(portfolioId: string, userId: string, holding: any) {
    try {
      const { data, error } = await db
        .from('holdings')
        .insert({ portfolio_id: portfolioId, user_id: userId, ticker: holding.ticker, name: holding.name, asset_type: holding.asset_type || 'stock', shares: holding.shares, cost_basis: holding.cost_basis, purchase_date: holding.purchase_date, notes: holding.notes })
        .select()
        .single()
      if (error) throw error
      return { data, error: null, success: true } as ServiceResponse<any>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<any>
    }
  },

  async updateHolding(holdingId: string, updates: any) {
    try {
      const { data, error } = await db.from('holdings').update(updates).eq('id', holdingId).select().single()
      if (error) throw error
      return { data, error: null, success: true } as ServiceResponse<any>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<any>
    }
  },

  async removeHolding(holdingId: string) {
    try {
      const { error } = await db.from('holdings').delete().eq('id', holdingId)
      if (error) throw error
      return { data: null, error: null, success: true } as ServiceResponse<null>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<null>
    }
  },

  async calculateMetrics(portfolioId: string) {
    try {
      const { data: holdings } = await db.from('holdings').select('*').eq('portfolio_id', portfolioId)
      if (!holdings || holdings.length === 0) {
        return { data: null, error: 'No holdings found', success: false } as ServiceResponse<any>
      }
      const totalCost = holdings.reduce((sum: number, h: any) => sum + h.cost_basis * h.shares, 0)
      return { data: { total_cost: totalCost, holdings_count: holdings.length }, error: null, success: true } as ServiceResponse<any>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<any>
    }
  },
}
