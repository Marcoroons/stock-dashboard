import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Menu, Bell, Search, Sun, Moon } from 'lucide-react'
import { Sidebar, MobileSidebar } from './Sidebar'
import { useAuth } from '@/context/AuthContext'
import { useAlerts } from '@/context/AlertsContext'
import { useTheme } from '@/context/ThemeContext'
import { track } from '@/lib/analytics'
import { cn } from '@/lib/utils'

function PageTracker() {
  const location = useLocation()
  useEffect(() => {
    track('page_viewed', { path: location.pathname })
  }, [location.pathname])
  return null
}

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { profile } = useAuth()
  const { unreadCount } = useAlerts()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const initials = (profile?.full_name ?? profile?.email ?? 'U').charAt(0).toUpperCase()

  return (
    <div className="flex min-h-screen bg-stone-50 dark:bg-stone-950">
      <PageTracker />

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />
      </div>

      {/* Mobile sidebar */}
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className={cn(
          'h-16 flex items-center gap-3 px-4 md:px-6 sticky top-0 z-30',
          'border-b border-stone-200 dark:border-stone-800',
          'bg-white/90 dark:bg-stone-900/90 backdrop-blur-md',
        )}>
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            className="lg:hidden p-2 -ml-1 rounded-[8px] text-stone-500 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
              <input
                placeholder="Search ticker, company…"
                className={cn(
                  'w-full rounded-[10px] border pl-10 pr-4 py-2 text-sm transition-all duration-200',
                  'bg-stone-100 border-transparent text-stone-900 placeholder-stone-400',
                  'focus:outline-none focus:bg-white focus:border-stone-300',
                  'dark:bg-stone-800 dark:text-stone-100 dark:placeholder-stone-500',
                  'dark:focus:bg-stone-700 dark:focus:border-stone-600',
                )}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              className="w-9 h-9 rounded-[10px] flex items-center justify-center transition-colors cursor-pointer text-stone-500 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-stone-100 dark:hover:bg-stone-800"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Alerts bell */}
            <button
              onClick={() => navigate('/alerts')}
              aria-label={`Alerts${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
              className="relative w-9 h-9 rounded-[10px] flex items-center justify-center transition-colors cursor-pointer text-stone-500 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-sky-600 dark:bg-sky-500 flex items-center justify-center text-sm font-semibold text-white flex-shrink-0">
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
