import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Briefcase, Search, BookOpen, TrendingUp, Settings, LogOut, ChevronRight, Dna, Target, ChartBar as BarChart3, Newspaper, Menu, X, Zap, Users, Shield, Activity, ChartPie as PieChart, Bell, Sparkles } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useAlerts } from '@/context/AlertsContext'
import { useSubscription } from '@/context/SubscriptionContext'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/portfolio', icon: Briefcase, label: 'Portfolio' },
  { href: '/doctor', icon: Activity, label: 'Portfolio Doctor', tier: 'plus' },
  { href: '/funds', icon: PieChart, label: 'Fund Intel' },
  { href: '/analyze', icon: Search, label: 'Analyze' },
  { href: '/dna', icon: Dna, label: 'Investor DNA' },
  { href: '/opportunities', icon: TrendingUp, label: 'Opportunities', tier: 'plus' },
  { href: '/news', icon: Newspaper, label: 'News Intel', tier: 'plus' },
  { href: '/goals', icon: Target, label: 'Life Goals' },
  { href: '/alerts', icon: Bell, label: 'Alerts', tier: 'pro' },
  { href: '/stress-test', icon: Shield, label: 'Stress Test', tier: 'pro' },
  { href: '/insider', icon: Users, label: 'Insider Activity', tier: 'pro' },
  { href: '/academy', icon: BookOpen, label: 'Academy' },
  { href: '/ai-coach', icon: Zap, label: 'AI Coach', tier: 'pro' },
] as const

const TIER_COLORS: Record<string, string> = {
  plus: '#06b6d4',
  pro:  '#f59e0b',
}

const TIER_META = {
  free: { label: 'Free',   color: '#64748b', bg: 'rgba(100,116,139,0.12)' },
  plus: { label: 'Plus',   color: '#06b6d4', bg: 'rgba(6,182,212,0.12)'   },
  pro:  { label: 'Pro',    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
} as const

// Fix: use BookOpen for Academy
const NAV_ITEMS_FIXED = [
  { href: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/portfolio',   icon: Briefcase,       label: 'Portfolio' },
  { href: '/doctor',      icon: Activity,        label: 'Portfolio Doctor', tier: 'plus' },
  { href: '/funds',       icon: PieChart,        label: 'Fund Intel' },
  { href: '/analyze',     icon: Search,          label: 'Analyze' },
  { href: '/dna',         icon: Dna,             label: 'Investor DNA' },
  { href: '/opportunities',icon: TrendingUp,     label: 'Opportunities', tier: 'plus' },
  { href: '/news',        icon: Newspaper,       label: 'News Intel', tier: 'plus' },
  { href: '/goals',       icon: Target,          label: 'Life Goals' },
  { href: '/alerts',      icon: Bell,            label: 'Alerts', tier: 'pro' },
  { href: '/stress-test', icon: Shield,          label: 'Stress Test', tier: 'pro' },
  { href: '/insider',     icon: Users,           label: 'Insider Activity', tier: 'pro' },
  { href: '/academy',     icon: BookOpen,        label: 'Academy' },
  { href: '/ai-coach',    icon: Zap,             label: 'AI Coach', tier: 'pro' },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation()
  const { profile, signOut } = useAuth()
  const { unreadCount } = useAlerts()
  const { tier, openUpgrade } = useSubscription()
  const tierMeta = TIER_META[tier]

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

      {/* Tier badge + upgrade CTA */}
      {!collapsed && (
        <div className="px-3 py-2 space-y-1.5">
          {/* Current tier */}
          <div
            className="flex items-center gap-2 rounded-[10px] px-2.5 py-2 border"
            style={{ background: tierMeta.bg, borderColor: `${tierMeta.color}30` }}
          >
            <Sparkles className="w-3 h-3 flex-shrink-0" style={{ color: tierMeta.color }} />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-[#475569] uppercase tracking-wide leading-none mb-0.5">Plan</p>
              <p className="text-xs font-bold" style={{ color: tierMeta.color }}>{tierMeta.label}</p>
            </div>
            {tier !== 'pro' && (
              <Link
                to="/pricing"
                className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full transition-all hover:opacity-90"
                style={{ background: '#3b82f620', color: '#60a5fa' }}
              >
                Upgrade
              </Link>
            )}
          </div>

          {/* DNA link */}
          <Link
            to="/dna"
            className="flex items-center gap-2 bg-[rgba(59,130,246,0.06)] rounded-[10px] p-2.5 border border-[rgba(59,130,246,0.12)] hover:bg-[rgba(59,130,246,0.1)] transition-colors"
          >
            <Dna className="w-3.5 h-3.5 text-[#3b82f6] flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-[#64748b] uppercase tracking-wide">DNA Profile</p>
              <p className="text-xs text-[#f1f5f9] truncate font-medium">View archetypes</p>
            </div>
            <BarChart3 className="w-3 h-3 text-[#3b82f6] ml-auto flex-shrink-0" />
          </Link>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {NAV_ITEMS_FIXED.map(item => {
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
                'relative flex items-center gap-3 px-2.5 py-2 rounded-[8px] transition-all duration-150',
                active
                  ? 'bg-[rgba(59,130,246,0.15)] text-[#60a5fa]'
                  : 'text-[#64748b] hover:text-[#94a3b8] hover:bg-[#0f0f1a]',
              )}
            >
              <item.icon className={cn('w-4 h-4 flex-shrink-0', active && 'text-[#3b82f6]')} />
              {!collapsed && (
                <span className="text-sm font-medium truncate flex-1">{item.label}</span>
              )}
              {/* Alert badge */}
              {!collapsed && item.href === '/alerts' && unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-[#ef4444] text-white px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none flex-shrink-0">
                  {unreadCount}
                </span>
              )}
              {collapsed && item.href === '/alerts' && unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#ef4444] rounded-full" />
              )}
              {/* Tier lock badge */}
              {!collapsed && locked && item.tier && (
                <span
                  className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: `${TIER_COLORS[item.tier]}18`, color: TIER_COLORS[item.tier] }}
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
        {/* Upgrade nudge for free users */}
        {!collapsed && tier === 'free' && (
          <Link
            to="/pricing"
            className="flex items-center gap-2 px-2.5 py-2 rounded-[8px] mb-1 transition-all hover:opacity-90"
            style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#06b6d4] flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-[#06b6d4]">Upgrade to Plus</p>
              <p className="text-[10px] text-[#475569]">$5/mo early bird</p>
            </div>
          </Link>
        )}

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
              {NAV_ITEMS_FIXED.map(item => (
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
