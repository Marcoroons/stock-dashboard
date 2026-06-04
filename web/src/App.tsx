import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { NotificationProvider } from '@/components/ui/Toast'
import { ModalProvider } from '@/components/ui/Modal'
import { AuthPage } from '@/pages/AuthPage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { PortfolioPage } from '@/pages/PortfolioPage'
import { AnalyzePage } from '@/pages/AnalyzePage'
import { OpportunitiesPage, GoalsPage, AcademyPage, SettingsPage } from '@/pages/OtherPages'
import { LoadingSpinner } from '@/components/ui/Skeleton'

function AppRoutes() {
  const { user, dna, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#09090f' }}>
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-[#64748b] text-sm">Loading your portfolio...</p>
        </div>
      </div>
    )
  }

  if (!user) return <AuthPage />
  if (!dna) return <OnboardingPage />

  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="analyze" element={<AnalyzePage />} />
        <Route path="opportunities" element={<OpportunitiesPage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="academy" element={<AcademyPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <ModalProvider>
            <AppRoutes />
          </ModalProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
