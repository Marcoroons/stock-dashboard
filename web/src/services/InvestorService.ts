/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabase'
import type { InvestorDNA, ServiceResponse } from '@/types/services'

const db = supabase as any

export const InvestorService = {
  async getProfile(userId: string) {
    try {
      const { data, error } = await db.from('profiles').select('*').eq('id', userId).maybeSingle()
      if (error) throw error
      return { data, error: null, success: !!data } as ServiceResponse<any>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<any>
    }
  },

  async updateProfile(userId: string, updates: any) {
    try {
      const { data, error } = await db.from('profiles').update(updates).eq('id', userId).select().single()
      if (error) throw error
      return { data, error: null, success: true } as ServiceResponse<any>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<any>
    }
  },

  async getDNA(userId: string) {
    try {
      const { data, error } = await db.from('dna_assessments').select('*').eq('user_id', userId).maybeSingle()
      if (error) throw error
      return { data, error: null, success: !!data } as ServiceResponse<InvestorDNA>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<InvestorDNA>
    }
  },

  async createDNA(userId: string, dnaData: Omit<InvestorDNA, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await db
        .from('dna_assessments')
        .insert({ ...dnaData, user_id: userId })
        .select()
        .single()
      if (error) throw error
      return { data, error: null, success: true } as ServiceResponse<InvestorDNA>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<InvestorDNA>
    }
  },

  async updateDNA(userId: string, dnaData: Partial<InvestorDNA>) {
    try {
      const { data, error } = await db.from('dna_assessments').update(dnaData).eq('user_id', userId).select().single()
      if (error) throw error
      return { data, error: null, success: true } as ServiceResponse<InvestorDNA>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<InvestorDNA>
    }
  },

  async getPreferences(userId: string) {
    try {
      const { data, error } = await db.from('preferences').select('*').eq('user_id', userId).maybeSingle()
      if (error) throw error
      return { data, error: null, success: !!data } as ServiceResponse<any>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<any>
    }
  },

  async updatePreferences(userId: string, preferences: Record<string, any>) {
    try {
      const { data: existing } = await db.from('preferences').select('id').eq('user_id', userId).maybeSingle()
      let result
      if (existing) {
        result = await db.from('preferences').update(preferences).eq('user_id', userId).select().single()
      } else {
        result = await db.from('preferences').insert({ user_id: userId, ...preferences }).select().single()
      }
      if (result.error) throw result.error
      return { data: result.data, error: null, success: true } as ServiceResponse<any>
    } catch (err) {
      return { data: null, error: String(err), success: false } as ServiceResponse<any>
    }
  },
}
