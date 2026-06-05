import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellOff, ChevronDown, ChevronUp, RefreshCw, CheckCheck, X, TrendingUp, Newspaper, Target, Briefcase, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Info, Sparkles } from 'lucide-react'
import { useAlerts } from '@/context/AlertsContext'
import { Card, Button, Badge } from '@/components/ui'
import { FeatureGate } from '@/components/ui/UpgradeModal'
import { LoadingSpinner } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'
import { useSubscription } from '@/context/SubscriptionContext'
import type { AlertType } from '@/lib/alert-engine'

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIORITY_META = {
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', label: 'Critical', Icon: AlertTriangle },
  warning:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', label: 'Warning', Icon: AlertTriangle },
  info:     { color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)', label: 'Info', Icon: Info },
  positive: { color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', label: 'Positive', Icon: CheckCircle },
} as const

const TYPE_META: Record<AlertType, { label: string; Icon: React.ComponentType<any>; color: string }> = {
  portfolio:   { label: 'Portfolio', Icon: Briefcase, color: '#3b82f6' },
  opportunity: { label: 'Opportunity', Icon: TrendingUp, color: '#10b981' },
  news:        { label: 'News', Icon: Newspaper, color: '#f59e0b' },
  goal:        { label: 'Goal', Icon: Target, color: '#06b6d4' },
}

type TabFilter = 'all' | AlertType

// ─── Alert Card ───────────────────────────────────────────────────────────────

function AlertCard({ alert, onMarkRead, onDismiss }: {
  alert: {
    id: string
    type: AlertType
    priority: 'critical' | 'warning' | 'info' | 'positive'
    title: string
    body: string
    meta: Record<string, unknown>
    read: boolean
    created_at: string
  }
  onMarkRead: (id: string) => void
  onDismiss: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const p = PRIORITY_META[alert.priority]
  const t = TYPE_META[alert.type]
  const hasExtra = alert.meta.whyItMatters || alert.meta.actionableInsight

  const timeAgo = (() => {
    const diff = Date.now() - new Date(alert.created_at).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(mins / 60)
    const days = Math.floor(hours / 24)
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return `${mins}m ago`
  })()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className={cn(
        'rounded-[12px] border overflow-hidden transition-all',
        !alert.read && 'ring-1 ring-inset',
      )}
      style={{
        background: p.bg,
        borderColor: p.border,
        ...((!alert.read) ? { ringColor: p.color } : {}),
      }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Priority icon */}
          <div
            className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: `${p.color}20` }}
          >
            <p.Icon className="w-4 h-4" style={{ color: p.color }} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: `${t.color}18`, color: t.color }}
                >
                  {t.label}
                </span>
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: `${p.color}15`, color: p.color }}
                >
                  {p.label}
                </span>
                {!alert.read && (
                  <span className="w-2 h-2 rounded-full bg-[#3b82f6] flex-shrink-0" />
                )}
              </div>
              <span className="text-xs text-[#475569] flex-shrink-0">{timeAgo}</span>
            </div>

            <h3 className={cn(
              'text-sm font-semibold leading-snug mb-1.5',
              alert.read ? 'text-[#94a3b8]' : 'text-[#f1f5f9]',
            )}>
              {alert.title}
            </h3>

            <p className="text-xs text-[#64748b] leading-relaxed line-clamp-2">
              {alert.body}
            </p>

            {/* Expandable news detail */}
            {hasExtra && (
              <button
                onClick={() => setExpanded(e => !e)}
                className="mt-2 text-xs flex items-center gap-1 transition-colors"
                style={{ color: p.color }}
              >
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {expanded ? 'Show less' : 'Full analysis'}
              </button>
            )}

            <AnimatePresence>
              {expanded && hasExtra && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 space-y-2 border-t pt-3" style={{ borderColor: p.border }}>
                    {alert.meta.whyItMatters && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-[#64748b] mb-1">Why it matters</p>
                        <p className="text-xs text-[#94a3b8] leading-relaxed">{String(alert.meta.whyItMatters)}</p>
                      </div>
                    )}
                    {alert.meta.actionableInsight && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-[#64748b] mb-1">Action</p>
                        <p className="text-xs text-[#94a3b8] leading-relaxed">{String(alert.meta.actionableInsight)}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {!alert.read && (
              <button
                onClick={() => onMarkRead(alert.id)}
                title="Mark as read"
                className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[#475569] hover:text-[#10b981] hover:bg-[rgba(16,185,129,0.1)] transition-colors cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => onDismiss(alert.id)}
              title="Dismiss"
              className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[#475569] hover:text-[#ef4444] hover:bg-[rgba(239,68,68,0.1)] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar({ alerts }: { alerts: Array<{ type: AlertType; priority: string; read: boolean }> }) {
  const critical = alerts.filter(a => a.priority === 'critical').length
  const warning = alerts.filter(a => a.priority === 'warning').length
  const positive = alerts.filter(a => a.priority === 'positive').length
  const unread = alerts.filter(a => !a.read).length

  const stats = [
    { label: 'Unread', value: unread, color: '#3b82f6' },
    { label: 'Critical', value: critical, color: '#ef4444' },
    { label: 'Warnings', value: warning, color: '#f59e0b' },
    { label: 'Positive', value: positive, color: '#10b981' },
  ]

  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map(s => (
        <div
          key={s.label}
          className="rounded-[10px] border p-3 text-center"
          style={{ background: `${s.color}08`, borderColor: `${s.color}20` }}
        >
          <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
          <p className="text-[10px] text-[#64748b] uppercase tracking-wide mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Tab button ───────────────────────────────────────────────────────────────

function TabButton({ label, count, active, onClick }: {
  label: string; count: number; active: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-[8px] text-sm font-medium transition-all flex items-center gap-2 cursor-pointer',
        active
          ? 'bg-[rgba(59,130,246,0.15)] text-[#60a5fa] border border-[rgba(59,130,246,0.3)]'
          : 'text-[#64748b] hover:text-[#94a3b8] hover:bg-[#0f0f1a] border border-transparent',
      )}
    >
      {label}
      {count > 0 && (
        <span
          className={cn(
            'text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
            active ? 'bg-[#3b82f6] text-white' : 'bg-[#1e1e3a] text-[#94a3b8]',
          )}
        >
          {count}
        </span>
      )}
    </button>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function AlertsPage() {
  const { hasAccess, openUpgrade } = useSubscription()
  const { alerts, unreadCount, loading, markRead, markAllRead, dismiss, refresh } = useAlerts()
  const [tab, setTab] = useState<TabFilter>('all')
  const [refreshing, setRefreshing] = useState(false)

  if (!hasAccess('stressTesting')) {
    return (
      <FeatureGate
        feature="stressTesting"
        hasAccess={false}
        onUpgrade={openUpgrade}
      />
    )
  }

  const filtered = tab === 'all' ? alerts : alerts.filter(a => a.type === tab)

  // Sort: critical first, then unread, then by date
  const sorted = [...filtered].sort((a, b) => {
    const pOrder = { critical: 0, warning: 1, info: 2, positive: 3 }
    if (!a.read && b.read) return -1
    if (a.read && !b.read) return 1
    return pOrder[a.priority] - pOrder[b.priority]
  })

  const counts: Record<TabFilter, number> = {
    all: alerts.length,
    portfolio: alerts.filter(a => a.type === 'portfolio').length,
    opportunity: alerts.filter(a => a.type === 'opportunity').length,
    news: alerts.filter(a => a.type === 'news').length,
    goal: alerts.filter(a => a.type === 'goal').length,
  }

  async function handleRefresh() {
    setRefreshing(true)
    // Force staleness by deleting existing alerts then reloading
    await refresh()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-[#64748b] text-sm">Generating your personalized alerts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5 text-[#3b82f6]" />
            <h1 className="text-2xl font-bold text-[#f1f5f9]">Alerts</h1>
            {unreadCount > 0 && (
              <span className="text-xs font-bold bg-[#3b82f6] text-white px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-[#64748b] text-sm">
            Personalized monitoring for your portfolio, opportunities, and goals
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead}>
              <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
              Mark all read
            </Button>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-9 h-9 rounded-[10px] border border-[#1e1e3a] flex items-center justify-center text-[#64748b] hover:text-[#f1f5f9] hover:bg-[#0f0f1a] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Stats */}
      {alerts.length > 0 && <StatsBar alerts={alerts} />}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'portfolio', 'opportunity', 'news', 'goal'] as TabFilter[]).map(t => (
          <TabButton
            key={t}
            label={t === 'all' ? 'All Alerts' : TYPE_META[t as AlertType]?.label ?? t}
            count={counts[t]}
            active={tab === t}
            onClick={() => setTab(t)}
          />
        ))}
      </div>

      {/* Alert list */}
      {sorted.length === 0 ? (
        <div className="py-16 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#0f0f1a] border border-[#1e1e3a] flex items-center justify-center">
            <BellOff className="w-6 h-6 text-[#334155]" />
          </div>
          <div>
            <p className="text-[#94a3b8] font-medium">No alerts in this category</p>
            <p className="text-sm text-[#475569] mt-1">
              {tab === 'all'
                ? 'Your portfolio is looking healthy — check back after market hours'
                : `No ${tab} alerts right now`}
            </p>
          </div>
          {tab !== 'all' && (
            <Button variant="ghost" size="sm" onClick={() => setTab('all')}>
              View all alerts
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {sorted.map(alert => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onMarkRead={markRead}
                onDismiss={dismiss}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Footer info */}
      {alerts.length > 0 && (
        <div className="flex items-center gap-2 pt-2">
          <Sparkles className="w-3.5 h-3.5 text-[#334155]" />
          <p className="text-xs text-[#334155]">
            Alerts are personalized to your Investor DNA profile and refresh every 6 hours
          </p>
        </div>
      )}
    </div>
  )
}
