/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabase'
import type { Stock, News, ServiceResponse, PaginatedResponse } from '@/types/services'

const db = supabase as any

export const StockService = {
  async getStock(ticker: string) {
    try {
      const { data, error } = await db.from('stocks').select('*').eq('ticker', ticker.toUpperCase()).maybeSingle()
      if (error) throw error
      return { data, error: null, success: !!data } as ServiceResponse<Stock>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<Stock>
    }
  },

  async searchStocks(query: string, limit = 10) {
    try {
      const { data, error } = await db.from('stocks').select('ticker, name, sector').or(`ticker.ilike.%${query}%, name.ilike.%${query}%`).limit(limit)
      if (error) throw error
      return { data: data || [], error: null, success: true } as ServiceResponse<Partial<Stock>[]>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<Partial<Stock>[]>
    }
  },

  async getStocksByIndustry(industry: string, limit = 20, offset = 0) {
    try {
      const { data, error, count } = await db
        .from('stocks')
        .select('*', { count: 'exact' })
        .eq('industry', industry)
        .order('market_cap', { ascending: false })
        .range(offset, offset + limit - 1)
      if (error) throw error
      return { data: { data: data || [], total: count || 0, page: Math.floor(offset / limit) + 1, limit, total_pages: count ? Math.ceil(count / limit) : 0 }, error: null, success: true } as ServiceResponse<PaginatedResponse<Stock>>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<PaginatedResponse<Stock>>
    }
  },

  async getTopStocks(limit = 10) {
    try {
      const { data, error } = await db.from('stocks').select('*').order('market_cap', { ascending: false }).limit(limit)
      if (error) throw error
      return { data: data || [], error: null, success: true } as ServiceResponse<Stock[]>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<Stock[]>
    }
  },

  async getStockNews(ticker: string, limit = 10, offset = 0) {
    try {
      const { data, error, count } = await db
        .from('news')
        .select('*', { count: 'exact' })
        .eq('ticker', ticker.toUpperCase())
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1)
      if (error) throw error
      return { data: { data: data || [], total: count || 0, page: Math.floor(offset / limit) + 1, limit, total_pages: count ? Math.ceil(count / limit) : 0 }, error: null, success: true } as ServiceResponse<PaginatedResponse<News>>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<PaginatedResponse<News>>
    }
  },

  async updateStockPrice(ticker: string, currentPrice: number) {
    try {
      const { data, error } = await db.from('stocks').update({ current_price: currentPrice, last_updated: new Date().toISOString() }).eq('ticker', ticker.toUpperCase()).select().single()
      if (error) throw error
      return { data, error: null, success: true } as ServiceResponse<Stock>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<Stock>
    }
  },

  async getStockMetrics(ticker: string) {
    try {
      const { data, error } = await db.from('stocks').select('ticker, name, pe_ratio, dividend_yield, beta, eps, revenue_ttm, market_cap').eq('ticker', ticker.toUpperCase()).maybeSingle()
      if (error) throw error
      return { data, error: null, success: !!data } as ServiceResponse<Partial<Stock>>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<Partial<Stock>>
    }
  },
}
