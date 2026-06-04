import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, Bell, Search } from 'lucide-react'
import { Sidebar, MobileSidebar } from './Sidebar'
import { useAuth } from '@/context/AuthContext'

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { profile } = useAuth()

  return (
    <div className="flex min-h-screen" style={{ background: '#09090f' }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />
      </div>

      {/* Mobile sidebar */}
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="h-16 flex items-center gap-4 px-4 md:px-6 border-b border-[#1e1e3a] sticky top-0 z-30"
          style={{ background: 'rgba(9,9,15,0.92)', backdropFilter: 'blur(12px)' }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-[#64748b] hover:text-[#f1f5f9] transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
              <input
                placeholder="Search ticker, company..."
                className="w-full bg-[#0f0f1a] border border-[#1e1e3a] text-[#f1f5f9] rounded-[10px] pl-10 pr-4 py-2 text-sm placeholder-[#334155] focus:outline-none focus:border-[#3b82f6] transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button className="w-9 h-9 rounded-[10px] border border-[#1e1e3a] flex items-center justify-center text-[#64748b] hover:text-[#f1f5f9] hover:bg-[#0f0f1a] transition-colors cursor-pointer">
              <Bell className="w-4 h-4" />
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#06b6d4] flex items-center justify-center text-sm font-semibold text-white">
              {(profile?.full_name ?? profile?.email ?? 'U').charAt(0).toUpperCase()}
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
