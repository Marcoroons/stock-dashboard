import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Briefcase, Search, BookOpen, TrendingUp, Settings, LogOut, ChevronRight, Dna, Target, ChartBar as BarChart3, Newspaper, Menu, X, Zap, Users, Shield } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/portfolio', icon: Briefcase, label: 'Portfolio' },
  { href: '/analyze', icon: Search, label: 'Analyze' },
  { href: '/dna', icon: Dna, label: 'Investor DNA' },
  { href: '/opportunities', icon: TrendingUp, label: 'Opportunities', tier: 'plus' },
  { href: '/news', icon: Newspaper, label: 'News Intel', tier: 'plus' },
  { href: '/goals', icon: Target, label: 'Life Goals' },
  { href: '/stress-test', icon: Shield, label: 'Stress Test', tier: 'pro' },
  { href: '/insider', icon: Users, label: 'Insider Activity', tier: 'pro' },
  { href: '/academy', icon: BookOpen, label: 'Academy' },
  { href: '/ai-coach', icon: Zap, label: 'AI Coach', tier: 'pro' },
]

const TIER_COLORS: Record<string, string> = {
  plus: '#06b6d4',
  pro: '#f59e0b',
}

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation()
  const { profile, signOut } = useAuth()
  const tier = profile?.subscription_tier ?? 'free'

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="flex-shrink-0 h-screen sticky top-0 flex flex-col overflow-hidden"
      style={{ background: '#0a0a14', borderRight: '1px solid #1e1e3a' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-[#1e1e3a] min-h-[64px]">
        <div className="w-8 h-8 rounded-xl bg-[#3b82f6] flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm font-semibold text-[#f1f5f9] whitespace-nowrap"
          >
            Investor OS
          </motion.span>
        )}
        <button
          onClick={onToggle}
          className="ml-auto text-[#64748b] hover:text-[#f1f5f9] transition-colors cursor-pointer"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* DNA badge */}
      {!collapsed && (
        <div className="px-3 py-2">
          <Link
            to="/dna"
            className="flex items-center gap-2 bg-[rgba(59,130,246,0.08)] rounded-[10px] p-2.5 border border-[rgba(59,130,246,0.15)] hover:bg-[rgba(59,130,246,0.12)] transition-colors"
          >
            <Dna className="w-3.5 h-3.5 text-[#3b82f6] flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-[#64748b] uppercase tracking-wide">DNA Profile</p>
              <p className="text-xs text-[#f1f5f9] truncate capitalize font-medium">
                View archetypes
              </p>
            </div>
            <BarChart3 className="w-3 h-3 text-[#3b82f6] ml-auto flex-shrink-0" />
          </Link>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {NAV_ITEMS.map(item => {
          const active = location.pathname === item.href
          const locked = item.tier && (
            (item.tier === 'pro' && tier !== 'pro') ||
            (item.tier === 'plus' && tier === 'free')
          )
          return (
            <Link
              key={item.href}
              to={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-2.5 py-2 rounded-[8px] transition-all duration-150 group',
                active
                  ? 'bg-[rgba(59,130,246,0.15)] text-[#60a5fa]'
                  : 'text-[#64748b] hover:text-[#94a3b8] hover:bg-[#0f0f1a]',
              )}
            >
              <item.icon className={cn('w-4 h-4 flex-shrink-0', active && 'text-[#3b82f6]')} />
              {!collapsed && (
                <span className="text-sm font-medium truncate flex-1">{item.label}</span>
              )}
              {!collapsed && locked && (
                <span
                  className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full"
                  style={{ background: `${TIER_COLORS[item.tier!]}20`, color: TIER_COLORS[item.tier!] }}
                >
                  {item.tier}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#1e1e3a] p-3 space-y-0.5">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-2.5 py-2 rounded-[8px] text-[#64748b] hover:text-[#94a3b8] hover:bg-[#0f0f1a] transition-colors"
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Settings</span>}
        </Link>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-2.5 py-2 rounded-[8px] text-[#64748b] hover:text-[#ef4444] hover:bg-[rgba(239,68,68,0.06)] transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Sign out</span>}
        </button>
      </div>
    </motion.aside>
  )
}

interface MobileSidebarProps {
  open: boolean
  onClose: () => void
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          />
          <motion.div
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-[280px] z-50 lg:hidden"
            style={{ background: '#0a0a14', borderRight: '1px solid #1e1e3a' }}
          >
            <div className="flex items-center justify-between p-4 border-b border-[#1e1e3a]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#3b82f6] flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-[#f1f5f9]">Investor OS</span>
              </div>
              <button onClick={onClose} className="text-[#64748b] hover:text-[#f1f5f9]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-3 space-y-0.5">
              {NAV_ITEMS.map(item => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-[#64748b] hover:text-[#94a3b8] hover:bg-[#0f0f1a] transition-colors"
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
