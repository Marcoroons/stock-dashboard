import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { track } from '@/lib/analytics'
import { getTierAccess, type SubscriptionTier, type FeatureAccess } from '@/lib/subscription'
import { UpgradeModal, AccessCodeModal } from '@/components/ui/UpgradeModal'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubscriptionContextValue {
  tier: SubscriptionTier
  hasAccess: (feature: keyof FeatureAccess) => boolean
  openUpgrade: (feature?: keyof FeatureAccess, targetTier?: 'plus' | 'pro') => void
  redeemCode: (code: string) => Promise<{ success: boolean; error?: string; tier?: string }>
  isLoadingCheckout: boolean
}

// ─── Context ──────────────────────────────────────────────────────────────────

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { profile, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [upgradeState, setUpgradeState] = useState<{
    open: boolean
    feature?: keyof FeatureAccess
    targetTier: 'plus' | 'pro'
  }>({ open: false, targetTier: 'plus' })

  const [accessCodeOpen, setAccessCodeOpen] = useState(false)
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false)

  const tier: SubscriptionTier = (profile?.subscription_tier as SubscriptionTier) ?? 'free'
  const access = getTierAccess(tier)

  const hasAccess = useCallback(
    (feature: keyof FeatureAccess) => access[feature],
    [access],
  )

  const openUpgrade = useCallback((feature?: keyof FeatureAccess, targetTier?: 'plus' | 'pro') => {
    // Determine required tier from feature if not explicitly passed
    const proFeatures: Array<keyof FeatureAccess> = ['stressTesting', 'insiderActivity', 'advancedAnalytics', 'aiCoach']
    const required = targetTier ?? (feature && proFeatures.includes(feature) ? 'pro' : 'plus')
    track('feature_gate_hit', { feature: feature ?? 'unknown', required_tier: required })
    setUpgradeState({ open: true, feature, targetTier: required })
  }, [])

  const handleCheckout = useCallback(async (checkoutTier: 'plus' | 'pro') => {
    setIsLoadingCheckout(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/auth')
        return
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          tier: checkoutTier,
          successUrl: `${window.location.origin}/settings?upgrade=success&tier=${checkoutTier}`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        },
      })

      if (error) throw error
      if (data?.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Checkout error:', err)
    } finally {
      setIsLoadingCheckout(false)
    }
  }, [navigate])

  const redeemCode = useCallback(async (code: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.rpc as any)('redeem_access_code', { input_code: code })
    if (error) return { success: false, error: error.message }
    const result = data as { success: boolean; error?: string; tier?: string } | null
    if (!result?.success) return { success: false, error: result?.error ?? 'Invalid code' }
    await refreshProfile()
    return { success: true, tier: result.tier }
  }, [refreshProfile])

  const closeUpgrade = useCallback(() => {
    setUpgradeState(s => ({ ...s, open: false }))
  }, [])

  const openAccessCode = useCallback(() => {
    closeUpgrade()
    setAccessCodeOpen(true)
  }, [closeUpgrade])

  return (
    <SubscriptionContext.Provider value={{
      tier,
      hasAccess,
      openUpgrade,
      redeemCode,
      isLoadingCheckout,
    }}>
      {children}

      {/* Global upgrade modal */}
      {upgradeState.open && (
        <UpgradeModal
          targetTier={upgradeState.targetTier}
          feature={upgradeState.feature}
          onClose={closeUpgrade}
          onCheckout={handleCheckout}
          onAccessCode={openAccessCode}
          isLoading={isLoadingCheckout}
        />
      )}

      {/* Global access code modal */}
      {accessCodeOpen && (
        <AccessCodeModal
          onClose={() => setAccessCodeOpen(false)}
          onRedeem={redeemCode}
        />
      )}
    </SubscriptionContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSubscription() {
  const ctx = useContext(SubscriptionContext)
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider')
  return ctx
}
