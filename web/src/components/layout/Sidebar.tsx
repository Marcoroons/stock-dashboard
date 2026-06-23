import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Briefcase, Search, BookOpen, TrendingUp, Settings, LogOut,
  ChevronRight, Dna, Target, BarChart3, Newspaper, Menu, X, Zap, Users,
  Shield, Activity, PieChart, Bell, Sparkles, ShieldAlert,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useAlerts } from '@/context/AlertsContext'
import { useSubscription } from '@/context/SubscriptionContext'
import { MadyLogo } from '@/components/ui/MadyLogo'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  icon: React.FC<{ className?: string }>
  label: string
  tier?: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/portfolio',    icon: Briefcase,        label: 'Portfolio' },
  { href: '/doctor',       icon: Activity,         label: 'Portfolio Doctor', tier: 'plus' },
  { href: '/funds',        icon: PieChart,         label: 'Fund Intel' },
  { href: '/analyze',      icon: Search,           label: 'Analyze' },
  { href: '/dna',          icon: Dna,              label: 'Investor DNA' },
  { href: '/opportunities',icon: TrendingUp,        label: 'Opportunities', tier: 'plus' },
  { href: '/news',         icon: Newspaper,         label: 'News Intel', tier: 'plus' },
  { href: '/goals',        icon: Target,            label: 'Life Goals' },
  { href: '/alerts',       icon: Bell,              label: 'Alerts', tier: 'pro' },
  { href: '/stress-test',  icon: Shield,            label: 'Stress Test', tier: 'pro' },
  { href: '/insider',      icon: Users,             label: 'Insider Activity', tier: 'pro' },
  { href: '/academy',      icon: BookOpen,          label: 'Academy' },
  { href: '/ai-coach',     icon: Zap,               label: 'AI Coach', tier: 'pro' },
]

const TIER_BADGE: Record<string, string> = {
  plus: 'text-sky-600 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-900/20 dark:border-sky-800',
  pro:  'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-800',
}

const TIER_META = {
  free: { label: 'Free', cls: 'text-stone-500 bg-stone-100 border-stone-200 dark:text-stone-400 dark:bg-stone-800 dark:border-stone-700' },
  plus: { label: 'Plus', cls: 'text-sky-600 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-900/20 dark:border-sky-800' },
  pro:  { label: 'Pro',  cls: 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-800' },
} as const

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation()
  const { profile, signOut } = useAuth()
  const { unreadCount } = useAlerts()
  const { tier } = useSubscription()
  const tierMeta = TIER_META[tier]

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className={cn(
        'flex-shrink-0 h-screen sticky top-0 flex flex-col overflow-hidden',
        'bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800',
      )}
    >
      {/* Logo row */}
      <div className="flex items-center gap-2.5 p-4 border-b border-stone-200 dark:border-stone-800 min-h-[64px]">
        <MadyLogo className="w-7 h-7 text-[#0C0A09] dark:text-white flex-shrink-0" />
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-light tracking-[0.18em] uppercase text-[#0C0A09] dark:text-white whitespace-nowrap"
          >
            Mady Finance
          </motion.span>
        )}
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="ml-auto text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 transition-colors cursor-pointer"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Tier + DNA links */}
      {!collapsed && (
        <div className="px-3 py-2 space-y-1.5">
          <div className={cn(
            'flex items-center gap-2 rounded-[10px] px-2.5 py-2 border',
            tierMeta.cls,
          )}>
            <Sparkles className="w-3 h-3 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wide leading-none mb-0.5 opacity-60">Plan</p>
              <p className="text-xs font-bold">{tierMeta.label}</p>
            </div>
            {tier !== 'pro' && (
              <Link
                to="/pricing"
                className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400 transition-colors"
              >
                Upgrade
              </Link>
            )}
          </div>

          <Link
            to="/dna"
            className={cn(
              'flex items-center gap-2 rounded-[10px] p-2.5 border transition-colors',
              'bg-stone-50 border-stone-200 hover:bg-stone-100',
              'dark:bg-stone-800 dark:border-stone-700 dark:hover:bg-stone-700',
            )}
          >
            <Dna className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-stone-400 uppercase tracking-wide">DNA Profile</p>
              <p className="text-xs text-stone-700 dark:text-stone-200 truncate font-medium">View archetypes</p>
            </div>
            <BarChart3 className="w-3 h-3 text-sky-600 dark:text-sky-400 ml-auto flex-shrink-0" />
          </Link>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {NAV_ITEMS.map(item => {
          const active = location.pathname === item.href
          const locked = item.tier && (
            (item.tier === 'pro'  && tier !== 'pro') ||
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
                  ? 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-stone-800',
              )}
            >
              <item.icon className={cn('w-4 h-4 flex-shrink-0', active && 'text-sky-600 dark:text-sky-400')} />
              {!collapsed && (
                <span className="text-sm font-medium truncate flex-1">{item.label}</span>
              )}
              {/* Alert badge */}
              {!collapsed && item.href === '/alerts' && unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none flex-shrink-0">
                  {unreadCount}
                </span>
              )}
              {collapsed && item.href === '/alerts' && unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
              {/* Tier lock badge */}
              {!collapsed && locked && item.tier && (
                <span className={cn(
                  'text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border flex-shrink-0',
                  TIER_BADGE[item.tier],
                )}>
                  {item.tier}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-stone-200 dark:border-stone-800 p-3 space-y-0.5">
        {!collapsed && tier === 'free' && (
          <Link
            to="/pricing"
            className={cn(
              'flex items-center gap-2 px-2.5 py-2 rounded-[8px] mb-1 transition-all border',
              'bg-sky-50 border-sky-200 hover:bg-sky-100',
              'dark:bg-sky-900/20 dark:border-sky-800 dark:hover:bg-sky-900/40',
            )}
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-sky-700 dark:text-sky-400">Upgrade to Plus</p>
              <p className="text-[10px] text-stone-500 dark:text-stone-400">$5/mo early bird</p>
            </div>
          </Link>
        )}

        {profile?.is_admin && (
          <Link
            to="/admin"
            className="flex items-center gap-3 px-2.5 py-2 rounded-[8px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span className="text-sm">Admin</span>}
          </Link>
        )}
        <Link
          to="/settings"
          className="flex items-center gap-3 px-2.5 py-2 rounded-[8px] text-stone-500 hover:text-stone-800 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-stone-800 transition-colors"
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Settings</span>}
        </Link>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-2.5 py-2 rounded-[8px] text-stone-500 hover:text-red-600 hover:bg-red-50 dark:text-stone-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
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
            className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'fixed left-0 top-0 bottom-0 w-[280px] z-50 lg:hidden',
              'bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800',
            )}
          >
            <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2.5">
                <MadyLogo className="w-7 h-7 text-[#0C0A09] dark:text-white flex-shrink-0" />
                <span className="text-sm font-light tracking-[0.18em] uppercase text-[#0C0A09] dark:text-white">Mady Finance</span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close navigation"
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-3 space-y-0.5 overflow-y-auto h-[calc(100%-65px)]">
              {NAV_ITEMS.map(item => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-stone-600 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-stone-800 transition-colors"
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
