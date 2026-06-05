import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, Users, CreditCard, Tag, ChartBar as BarChart2, Shield } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { AdminOverview } from './admin/AdminOverview'
import { AdminUsers } from './admin/AdminUsers'
import { AdminSubscriptions } from './admin/AdminSubscriptions'
import { AdminCodes } from './admin/AdminCodes'
import { AdminAnalytics } from './admin/AdminAnalytics'
import { LoadingSpinner } from '@/components/ui/Skeleton'

const TABS = [
  { id: 'overview',       label: 'Overview',      icon: LayoutDashboard },
  { id: 'users',          label: 'Users',         icon: Users },
  { id: 'subscriptions',  label: 'Subscriptions', icon: CreditCard },
  { id: 'codes',          label: 'Access Codes',  icon: Tag },
  { id: 'analytics',      label: 'Analytics',     icon: BarChart2 },
] as const

type TabId = typeof TABS[number]['id']

export function AdminPage() {
  const { profile, loading } = useAuth()
  const [tab, setTab] = useState<TabId>('overview')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#09090f' }}>
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!profile?.is_admin) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: '#09090f' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-[12px] bg-[rgba(239,68,68,0.15)] flex items-center justify-center">
          <Shield className="w-5 h-5 text-[#ef4444]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#f1f5f9]">Admin Panel</h1>
          <p className="text-xs text-[#475569]">Restricted to admin accounts</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 p-1 rounded-[14px] w-fit" style={{ background: '#0f0f1a', border: '1px solid #1e1e3a' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-medium transition-all cursor-pointer"
            style={
              tab === t.id
                ? { background: '#1e1e3a', color: '#f1f5f9' }
                : { color: '#64748b' }
            }
          >
            <t.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
      >
        {tab === 'overview'      && <AdminOverview />}
        {tab === 'users'         && <AdminUsers />}
        {tab === 'subscriptions' && <AdminSubscriptions />}
        {tab === 'codes'         && <AdminCodes />}
        {tab === 'analytics'     && <AdminAnalytics />}
      </motion.div>
    </div>
  )
}
