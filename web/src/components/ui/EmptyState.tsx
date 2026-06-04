import { motion } from 'framer-motion'
import { Briefcase, Eye, TrendingUp, CircleAlert as AlertCircle, BookOpen, Plus } from 'lucide-react'
import { Button } from './Button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon = <AlertCircle className="w-12 h-12 text-[#3b82f6]" />,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex flex-col items-center justify-center py-12 px-4', className)}
    >
      <div className="mb-4 text-[#1e1e3a]">{icon}</div>
      <h3 className="text-lg font-semibold text-[#f1f5f9] mb-2">{title}</h3>
      <p className="text-sm text-[#94a3b8] text-center max-w-sm mb-6">{description}</p>
      <div className="flex gap-3">
        {action && (
          <Button onClick={action.onClick}>
            <Plus className="w-3.5 h-3.5" />
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button variant="secondary" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </motion.div>
  )
}

interface NoPortfolioStateProps {
  onCreatePortfolio?: () => void
  onLearnMore?: () => void
}

export function NoPortfolioState({ onCreatePortfolio, onLearnMore }: NoPortfolioStateProps) {
  return (
    <EmptyState
      icon={<Briefcase className="w-12 h-12 text-[#3b82f6]" />}
      title="No Portfolio Yet"
      description="Create your first portfolio to start tracking your investments and analyzing your holdings."
      action={{ label: 'Create Portfolio', onClick: onCreatePortfolio || (() => {}) }}
      secondaryAction={{ label: 'Learn More', onClick: onLearnMore || (() => {}) }}
    />
  )
}

interface NoWatchlistStateProps {
  onAddStocks?: () => void
}

export function NoWatchlistState({ onAddStocks }: NoWatchlistStateProps) {
  return (
    <EmptyState
      icon={<Eye className="w-12 h-12 text-[#06b6d4]" />}
      title="Watchlist Empty"
      description="Start watching stocks you're interested in to track their performance and receive insights."
      action={{ label: 'Add Stocks', onClick: onAddStocks || (() => {}) }}
    />
  )
}

export function NoOpportunitiesState() {
  return (
    <EmptyState
      icon={<TrendingUp className="w-12 h-12 text-[#10b981]" />}
      title="No Opportunities Yet"
      description="The opportunity scanner will surface investment recommendations based on your Investor DNA and market conditions."
      className="py-20"
    />
  )
}

export function NoNewsState() {
  return (
    <EmptyState
      icon={<AlertCircle className="w-12 h-12 text-[#f59e0b]" />}
      title="No News Available"
      description="News intelligence for your holdings will appear here as new articles are published."
      className="py-20"
    />
  )
}

interface NoEducationStateProps {
  onStartLearning?: () => void
}

export function NoEducationState({ onStartLearning }: NoEducationStateProps) {
  return (
    <EmptyState
      icon={<BookOpen className="w-12 h-12 text-[#a78bfa]" />}
      title="Start Learning"
      description="Explore our investing academy to build your financial knowledge from the ground up."
      action={{ label: 'View Academy', onClick: onStartLearning || (() => {}) }}
      className="py-20"
    />
  )
}

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'An error occurred while loading this content. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <EmptyState
      icon={<AlertCircle className="w-12 h-12 text-[#ef4444]" />}
      title={title}
      description={description}
      action={onRetry ? { label: 'Try Again', onClick: onRetry } : undefined}
      className="py-20"
    />
  )
}
