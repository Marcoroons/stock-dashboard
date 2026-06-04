import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { AuthPage } from '@/pages/AuthPage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { PortfolioPage } from '@/pages/PortfolioPage'
import { AnalyzePage } from '@/pages/AnalyzePage'
import { OpportunitiesPage, GoalsPage, AcademyPage, SettingsPage } from '@/pages/OtherPages'

function AppRoutes() {
  const { user, dna, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#09090f' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#3b82f6] flex items-center justify-center animate-pulse">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeWidth={2} strokeLinecap="round" d="M3 13l4-4 4 4 4-6 4 4" />
            </svg>
          </div>
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
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
