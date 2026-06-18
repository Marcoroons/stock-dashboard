import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { AlertsProvider } from '@/context/AlertsContext'
import { NotificationProvider } from '@/components/ui/Toast'
import { ModalProvider } from '@/components/ui/Modal'
import { SubscriptionProvider } from '@/context/SubscriptionContext'
import { AuthPage } from '@/pages/AuthPage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { DisclaimerPage } from '@/pages/DisclaimerPage'
import { Tutorial } from '@/components/ui/Tutorial'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { PortfolioPage } from '@/pages/PortfolioPage'
import { AnalyzePage } from '@/pages/AnalyzePage'
import { DnaProfilePage } from '@/pages/DnaProfilePage'
import { AcademyPage, SettingsPage } from '@/pages/OtherPages'
import { OpportunitiesPage } from '@/pages/OpportunitiesPage'
import { GoalsPage } from '@/pages/GoalsPage'
import { PortfolioDoctorPage } from '@/pages/PortfolioDoctorPage'
import { FundAnalysisPage } from '@/pages/FundAnalysisPage'
import { NewsPage } from '@/pages/NewsPage'
import { AlertsPage } from '@/pages/AlertsPage'
import { StressTestPage } from '@/pages/StressTestPage'
import { PricingPage } from '@/pages/PricingPage'
import { AdminPage } from '@/pages/AdminPage'
import { LoadingSpinner } from '@/components/ui/Skeleton'

function AppRoutes() {
  const { user, dna, loading } = useAuth()

  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)
  const [dnaSkipped, setDnaSkipped]                 = useState(false)
  const [tutorialDone, setTutorialDone]             = useState(false)

  useEffect(() => {
    if (!user) return
    setDisclaimerAccepted(localStorage.getItem(`disclaimer_${user.id}`) === '1')
    setDnaSkipped(localStorage.getItem(`dna_skip_${user.id}`) === '1')
    setTutorialDone(localStorage.getItem(`tutorial_done_${user.id}`) === '1')
  }, [user?.id])

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

  function completeTutorial() {
    if (!user) return
    localStorage.setItem(`tutorial_done_${user.id}`, '1')
    setTutorialDone(true)
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

  if (!user) return <AuthPage />
  if (!disclaimerAccepted) return <DisclaimerPage onAccept={acceptDisclaimer} />
  if (!dna && !dnaSkipped) return <OnboardingPage onSkip={skipDna} />

  return (
    <AlertsProvider>
      <SubscriptionProvider>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="portfolio" element={<PortfolioPage />} />
            <Route path="analyze" element={<AnalyzePage />} />
            <Route path="dna" element={<DnaProfilePage />} />
            <Route path="doctor" element={<PortfolioDoctorPage />} />
            <Route path="funds" element={<FundAnalysisPage />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="opportunities" element={<OpportunitiesPage />} />
            <Route path="goals" element={<GoalsPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="stress-test" element={<StressTestPage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="academy" element={<AcademyPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
        {!tutorialDone && <Tutorial onComplete={completeTutorial} />}
      </SubscriptionProvider>
    </AlertsProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <ModalProvider>
              <AppRoutes />
            </ModalProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
