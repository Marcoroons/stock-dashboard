import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { setAnalyticsUserId } from '@/lib/analytics'
import type { Profile, DnaAssessment } from '@/types/database'

interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: Profile | null
  dna: DnaAssessment | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null; needsConfirmation: boolean }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  refreshDna: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [dna, setDna] = useState<DnaAssessment | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    setProfile(data)
  }

  async function fetchDna(userId: string) {
    const { data } = await supabase
      .from('dna_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    setDna(data)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setAnalyticsUserId(session?.user?.id ?? null)
      if (session?.user) {
        Promise.all([
          fetchProfile(session.user.id),
          fetchDna(session.user.id),
        ]).catch(() => {}).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setAnalyticsUserId(session?.user?.id ?? null)
      if (session?.user) {
        Promise.all([
          fetchProfile(session.user.id),
          fetchDna(session.user.id),
        ]).catch(() => {})
      } else {
        setProfile(null)
        setDna(null)
      }
    })
  }, [])

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error as Error | null }
  }

  async function signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    })
    return {
      error: error as Error | null,
      needsConfirmation: !error && !data.session,
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user.id)
  }

  async function refreshDna() {
    if (user) await fetchDna(user.id)
  }

  return (
    <AuthContext.Provider value={{
      user, session, profile, dna, loading,
      signIn, signUp, signOut, refreshProfile, refreshDna,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
