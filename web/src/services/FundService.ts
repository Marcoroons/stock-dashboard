/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabase'
import type { ETF, ServiceResponse, PaginatedResponse } from '@/types/services'

const db = supabase as any

export const FundService = {
  async getETF(ticker: string) {
    try {
      const { data, error } = await db.from('etfs').select('*').eq('ticker', ticker.toUpperCase()).maybeSingle()
      if (error) throw error
      return { data, error: null, success: !!data } as ServiceResponse<ETF>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<ETF>
    }
  },

  async searchETFs(query: string, limit = 10) {
    try {
      const { data, error } = await db.from('etfs').select('ticker, name, category, expense_ratio').or(`ticker.ilike.%${query}%, name.ilike.%${query}%`).limit(limit)
      if (error) throw error
      return { data: data || [], error: null, success: true } as ServiceResponse<Partial<ETF>[]>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<Partial<ETF>[]>
    }
  },

  async getETFsByCategory(category: string, limit = 20, offset = 0) {
    try {
      const { data, error, count } = await db
        .from('etfs')
        .select('*', { count: 'exact' })
        .eq('category', category)
        .order('net_assets', { ascending: false })
        .range(offset, offset + limit - 1)
      if (error) throw error
      return { data: { data: data || [], total: count || 0, page: Math.floor(offset / limit) + 1, limit, total_pages: count ? Math.ceil(count / limit) : 0 }, error: null, success: true } as ServiceResponse<PaginatedResponse<ETF>>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<PaginatedResponse<ETF>>
    }
  },

  async getTopETFs(limit = 10) {
    try {
      const { data, error } = await db.from('etfs').select('*').order('net_assets', { ascending: false }).limit(limit)
      if (error) throw error
      return { data: data || [], error: null, success: true } as ServiceResponse<ETF[]>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<ETF[]>
    }
  },

  async getLowCostETFs(limit = 10) {
    try {
      const { data, error } = await db.from('etfs').select('*').lt('expense_ratio', 0.05).order('expense_ratio', { ascending: true }).limit(limit)
      if (error) throw error
      return { data: data || [], error: null, success: true } as ServiceResponse<ETF[]>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<ETF[]>
    }
  },

  async getETFHoldings(ticker: string, limit = 20, offset = 0) {
    try {
      const { data, error, count } = await db
        .from('etf_holdings')
        .select('*', { count: 'exact' })
        .eq('etf_ticker', ticker.toUpperCase())
        .order('weight', { ascending: false })
        .range(offset, offset + limit - 1)
      if (error) throw error
      return { data: { data: data || [], total: count || 0, page: Math.floor(offset / limit) + 1, limit, total_pages: count ? Math.ceil(count / limit) : 0 }, error: null, success: true } as ServiceResponse<PaginatedResponse<any>>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<PaginatedResponse<any>>
    }
  },

  async updateETFPrice(ticker: string, currentPrice: number) {
    try {
      const { data, error } = await db.from('etfs').update({ current_price: currentPrice, last_updated: new Date().toISOString() }).eq('ticker', ticker.toUpperCase()).select().single()
      if (error) throw error
      return { data, error: null, success: true } as ServiceResponse<ETF>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<ETF>
    }
  },

  async compareETFs(tickers: string[]) {
    try {
      const { data, error } = await db
        .from('etfs')
        .select('ticker, name, category, expense_ratio, three_year_return, ytd_return')
        .in('ticker', tickers.map(t => t.toUpperCase()))
      if (error) throw error
      return { data: data || [], error: null, success: true } as ServiceResponse<Partial<ETF>[]>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<Partial<ETF>[]>
    }
  },
}
