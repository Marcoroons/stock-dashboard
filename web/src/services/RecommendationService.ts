/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabase'
import type { Recommendation, ServiceResponse, PaginatedResponse } from '@/types/services'

const db = supabase as any

export const RecommendationService = {
  async getUserRecommendations(userId: string, limit = 10, offset = 0) {
    try {
      const now = new Date().toISOString()
      const { data, error, count } = await db
        .from('recommendations')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .gt('expires_at', now)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
      if (error) throw error
      return { data: { data: data || [], total: count || 0, page: Math.floor(offset / limit) + 1, limit, total_pages: count ? Math.ceil(count / limit) : 0 }, error: null, success: true } as ServiceResponse<PaginatedResponse<Recommendation>>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<PaginatedResponse<Recommendation>>
    }
  },

  async getRecommendationByTicker(userId: string, ticker: string) {
    try {
      const now = new Date().toISOString()
      const { data, error } = await db
        .from('recommendations')
        .select('*')
        .eq('user_id', userId)
        .eq('ticker', ticker.toUpperCase())
        .gt('expires_at', now)
        .maybeSingle()
      if (error) throw error
      return { data, error: null, success: !!data } as ServiceResponse<Recommendation>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<Recommendation>
    }
  },

  async createRecommendation(userId: string, rec: Omit<Recommendation, 'id' | 'created_at'>) {
    try {
      const { data, error } = await db.from('recommendations').insert({ ...rec, user_id: userId }).select().single()
      if (error) throw error
      return { data, error: null, success: true } as ServiceResponse<Recommendation>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<Recommendation>
    }
  },

  async updateRecommendation(recommendationId: string, updates: Partial<Recommendation>) {
    try {
      const { data, error } = await db.from('recommendations').update(updates).eq('id', recommendationId).select().single()
      if (error) throw error
      return { data, error: null, success: true } as ServiceResponse<Recommendation>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<Recommendation>
    }
  },

  async getHighConfidenceRecommendations(userId: string, minConfidence = 0.75, limit = 5) {
    try {
      const now = new Date().toISOString()
      const { data, error } = await db.from('recommendations').select('*').eq('user_id', userId).gte('confidence', minConfidence).gt('expires_at', now).order('confidence', { ascending: false }).limit(limit)
      if (error) throw error
      return { data: data || [], error: null, success: true } as ServiceResponse<Recommendation[]>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<Recommendation[]>
    }
  },

  async getBuyRecommendations(userId: string, limit = 5) {
    try {
      const now = new Date().toISOString()
      const { data, error } = await db.from('recommendations').select('*').eq('user_id', userId).eq('action', 'buy').gt('expires_at', now).order('dna_alignment_score', { ascending: false }).limit(limit)
      if (error) throw error
      return { data: data || [], error: null, success: true } as ServiceResponse<Recommendation[]>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<Recommendation[]>
    }
  },

  async getSellRecommendations(userId: string, limit = 5) {
    try {
      const now = new Date().toISOString()
      const { data, error } = await db.from('recommendations').select('*').eq('user_id', userId).eq('action', 'sell').gt('expires_at', now).order('created_at', { ascending: false }).limit(limit)
      if (error) throw error
      return { data: data || [], error: null, success: true } as ServiceResponse<Recommendation[]>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<Recommendation[]>
    }
  },

  async getAlignedRecommendations(userId: string, minAlignment = 0.8, limit = 10) {
    try {
      const now = new Date().toISOString()
      const { data, error } = await db.from('recommendations').select('*').eq('user_id', userId).gte('dna_alignment_score', minAlignment).gt('expires_at', now).order('dna_alignment_score', { ascending: false }).limit(limit)
      if (error) throw error
      return { data: data || [], error: null, success: true } as ServiceResponse<Recommendation[]>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<Recommendation[]>
    }
  },

  async dismissRecommendation(recommendationId: string) {
    try {
      const pastDate = new Date(Date.now() - 1000).toISOString()
      const { data, error } = await db.from('recommendations').update({ expires_at: pastDate }).eq('id', recommendationId).select().single()
      if (error) throw error
      return { data, error: null, success: true } as ServiceResponse<Recommendation>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<Recommendation>
    }
  },
}
