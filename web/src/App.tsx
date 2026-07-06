import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { AlertsProvider } from '@/context/AlertsContext'
import { NotificationProvider } from '@/components/ui/Toast'
import { ModalProvider } from '@/components/ui/Modal'
import { SubscriptionProvider } from '@/context/SubscriptionContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoadingSpinner } from '@/components/ui/Skeleton'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// ── Lazy-loaded pages — each becomes its own chunk so the initial bundle stays small ──
// Pre-auth / onboarding flow
const LandingPage     = lazy(() => import('@/pages/LandingPage').then(m => ({ default: m.LandingPage })))
const AuthPage        = lazy(() => import('@/pages/AuthPage').then(m => ({ default: m.AuthPage })))
const AuthConfirmPage = lazy(() => import('@/pages/AuthConfirmPage').then(m => ({ default: m.AuthConfirmPage })))
const AssessmentPage  = lazy(() => import('@/pages/AssessmentPage').then(m => ({ default: m.AssessmentPage })))
const ConclusionPage  = lazy(() => import('@/pages/ConclusionPage').then(m => ({ default: m.ConclusionPage })))
const DisclaimerPage  = lazy(() => import('@/pages/DisclaimerPage').then(m => ({ default: m.DisclaimerPage })))
// Post-auth one-time product tour — lazy so its Framer Motion + icon deps stay out of the initial bundle
const ProductTour     = lazy(() => import('@/components/ui/ProductTour').then(m => ({ default: m.ProductTour })))
// Main app routes
const DashboardPage       = lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const PortfolioPage       = lazy(() => import('@/pages/PortfolioPage').then(m => ({ default: m.PortfolioPage })))
const AnalyzePage         = lazy(() => import('@/pages/AnalyzePage').then(m => ({ default: m.AnalyzePage })))
const DnaProfilePage      = lazy(() => import('@/pages/DnaProfilePage').then(m => ({ default: m.DnaProfilePage })))
const AcademyPage         = lazy(() => import('@/pages/OtherPages').then(m => ({ default: m.AcademyPage })))
const SettingsPage        = lazy(() => import('@/pages/OtherPages').then(m => ({ default: m.SettingsPage })))
const OpportunitiesPage   = lazy(() => import('@/pages/OpportunitiesPage').then(m => ({ default: m.OpportunitiesPage })))
const GoalsPage           = lazy(() => import('@/pages/GoalsPage').then(m => ({ default: m.GoalsPage })))
const PortfolioDoctorPage = lazy(() => import('@/pages/PortfolioDoctorPage').then(m => ({ default: m.PortfolioDoctorPage })))
const FundAnalysisPage    = lazy(() => import('@/pages/FundAnalysisPage').then(m => ({ default: m.FundAnalysisPage })))
const NewsPage            = lazy(() => import('@/pages/NewsPage').then(m => ({ default: m.NewsPage })))
const AlertsPage          = lazy(() => import('@/pages/AlertsPage').then(m => ({ default: m.AlertsPage })))
const StressTestPage      = lazy(() => import('@/pages/StressTestPage').then(m => ({ default: m.StressTestPage })))
const PricingPage         = lazy(() => import('@/pages/PricingPage').then(m => ({ default: m.PricingPage })))
const AdminPage           = lazy(() => import('@/pages/AdminPage').then(m => ({ default: m.AdminPage })))

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-primary)' }}>
      <LoadingSpinner size="lg" />
    </div>
  )
}

function LegalRoute() {
  const navigate = useNavigate()
  return <DisclaimerPage onAccept={() => navigate('/settings')} />
}

function AppRoutes() {
  const { user, dna, loading } = useAuth()
  const location = useLocation()

  // All hooks must be declared before any conditional return
  // Pre-auth view: landing page or auth form
  const [authView, setAuthView]           = useState<'landing' | 'auth'>('landing')
  const [authMode, setAuthMode]           = useState<'signin' | 'signup'>('signin')
  // Post-auth gates
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)
  const [dnaSkipped, setDnaSkipped]                 = useState(false)
  const [conclusionSeen, setConclusionSeen]         = useState(false)
  const [tourDone, setTourDone]                     = useState(false)
  // After conclusion user can jump straight to pricing
  const [goToPricing, setGoToPricing]               = useState(false)

  useEffect(() => {
    if (!user) return
    setDisclaimerAccepted(localStorage.getItem(`disclaimer_${user.id}`) === '1')
    setDnaSkipped(localStorage.getItem(`dna_skip_${user.id}`) === '1')
    setConclusionSeen(localStorage.getItem(`conclusion_seen_${user.id}`) === '1')
    setTourDone(localStorage.getItem(`tutorial_done_${user.id}`) === '1')
  }, [user?.id])

  // Email confirmation callback — bypasses all auth gates
  if (location.pathname === '/auth/confirm') return <AuthConfirmPage />

  function acceptDisclaimer() {
    if (!user) return
    localStorage.setItem(`disclaimer_${user.id}`, '1')
    setDisclaimerAccepted(true)
  }

  function skipDna() {
    if (!user) return
    localStorage.setItem(`dna_skip_${user.id}`, '1')
    setDnaSkipped(true)
  }

  function markConclusionSeen() {
    if (!user) return
    localStorage.setItem(`conclusion_seen_${user.id}`, '1')
    setConclusionSeen(true)
  }

  function completeTour() {
    if (!user) return
    localStorage.setItem(`tutorial_done_${user.id}`, '1')
    setTourDone(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-primary)' }}>
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading your portfolio...</p>
        </div>
      </div>
    )
  }

  // ── Not authenticated ───────────────────────────────────────────────────────
  if (!user) {
    if (authView === 'landing') {
      return (
        <LandingPage
          onGetStarted={() => { setAuthMode('signup'); setAuthView('auth') }}
          onLogin={() => { setAuthMode('signin'); setAuthView('auth') }}
        />
      )
    }
    return <AuthPage initialMode={authMode} />
  }

  // ── Post-auth gates ─────────────────────────────────────────────────────────
  if (!disclaimerAccepted) return <DisclaimerPage onAccept={acceptDisclaimer} />

  if (!dna && !dnaSkipped) {
    return (
      <AssessmentPage
        onSkip={skipDna}
        onComplete={async () => {
          // refreshDna is called inside AssessmentPage; this callback is a no-op signal
        }}
      />
    )
  }

  if (dna && !conclusionSeen && !dnaSkipped) {
    return (
      <ConclusionPage
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dna={dna as any}
        onContinue={markConclusionSeen}
        onViewPricing={() => { markConclusionSeen(); setGoToPricing(true) }}
      />
    )
  }

  // ── Main app ────────────────────────────────────────────────────────────────
  return (
    <AlertsProvider>
      <SubscriptionProvider>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to={goToPricing ? '/pricing' : '/dashboard'} replace />} />
            <Route path="dashboard"    element={<DashboardPage />} />
            <Route path="portfolio"    element={<PortfolioPage />} />
            <Route path="analyze"      element={<AnalyzePage />} />
            <Route path="dna"          element={<DnaProfilePage />} />
            <Route path="doctor"       element={<PortfolioDoctorPage />} />
            <Route path="funds"        element={<FundAnalysisPage />} />
            <Route path="news"         element={<NewsPage />} />
            <Route path="opportunities" element={<OpportunitiesPage />} />
            <Route path="goals"        element={<GoalsPage />} />
            <Route path="alerts"       element={<AlertsPage />} />
            <Route path="stress-test"  element={<StressTestPage />} />
            <Route path="pricing"      element={<PricingPage />} />
            <Route path="admin"        element={<AdminPage />} />
            <Route path="academy"      element={<AcademyPage />} />
            <Route path="settings"     element={<SettingsPage />} />
            <Route path="legal"        element={<LegalRoute />} />
            <Route path="*"            element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
        {!tourDone && <Suspense fallback={null}><ProductTour onComplete={completeTour} /></Suspense>}
      </SubscriptionProvider>
    </AlertsProvider>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <ModalProvider>
                <Suspense fallback={<FullScreenLoader />}>
                  <AppRoutes />
                </Suspense>
              </ModalProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
