/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabase'
import type { News, ServiceResponse, PaginatedResponse } from '@/types/services'

const db = supabase as any

export const NewsService = {
  async getNews(limit = 20, offset = 0) {
    try {
      const { data, error, count } = await db
        .from('news')
        .select('*', { count: 'exact' })
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1)
      if (error) throw error
      return { data: { data: data || [], total: count || 0, page: Math.floor(offset / limit) + 1, limit, total_pages: count ? Math.ceil(count / limit) : 0 }, error: null, success: true } as ServiceResponse<PaginatedResponse<News>>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<PaginatedResponse<News>>
    }
  },

  async getNewsByTicker(ticker: string, limit = 10, offset = 0) {
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

  async getPortfolioNews(tickers: string[], limit = 15, offset = 0) {
    try {
      const upperTickers = tickers.map(t => t.toUpperCase())
      const { data, error, count } = await db
        .from('news')
        .select('*', { count: 'exact' })
        .in('ticker', upperTickers)
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1)
      if (error) throw error
      return { data: { data: data || [], total: count || 0, page: Math.floor(offset / limit) + 1, limit, total_pages: count ? Math.ceil(count / limit) : 0 }, error: null, success: true } as ServiceResponse<PaginatedResponse<News>>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<PaginatedResponse<News>>
    }
  },

  async getNewsBySentiment(sentiment: 'positive' | 'neutral' | 'negative', limit = 10, offset = 0) {
    try {
      const { data, error, count } = await db
        .from('news')
        .select('*', { count: 'exact' })
        .eq('sentiment', sentiment)
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1)
      if (error) throw error
      return { data: { data: data || [], total: count || 0, page: Math.floor(offset / limit) + 1, limit, total_pages: count ? Math.ceil(count / limit) : 0 }, error: null, success: true } as ServiceResponse<PaginatedResponse<News>>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<PaginatedResponse<News>>
    }
  },

  async getHighRelevanceNews(minRelevance = 0.7, limit = 10) {
    try {
      const { data, error } = await db.from('news').select('*').gte('relevance_score', minRelevance).order('published_at', { ascending: false }).limit(limit)
      if (error) throw error
      return { data: data || [], error: null, success: true } as ServiceResponse<News[]>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<News[]>
    }
  },

  async searchNews(query: string, limit = 10) {
    try {
      const { data, error } = await db.from('news').select('*').or(`headline.ilike.%${query}%, summary.ilike.%${query}%`).order('published_at', { ascending: false }).limit(limit)
      if (error) throw error
      return { data: data || [], error: null, success: true } as ServiceResponse<News[]>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<News[]>
    }
  },

  async addNews(news: Omit<News, 'id' | 'created_at'>) {
    try {
      const { data, error } = await db.from('news').insert(news).select().single()
      if (error) throw error
      return { data, error: null, success: true } as ServiceResponse<News>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<News>
    }
  },
}
