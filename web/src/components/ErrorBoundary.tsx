import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

// Detects a failed dynamic import — happens when a user holds an old index.html
// after a new deploy and the previously-hashed chunk no longer exists (404).
function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const msg = `${error.name} ${error.message}`
  return /chunk|dynamically imported module|importing a module script failed|failed to fetch/i.test(msg)
}

// Once-per-session guard so a genuinely broken chunk doesn't reload-loop forever.
const RELOAD_FLAG = 'mady_chunk_reloaded'

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }
  // True only between scheduling an auto-reload and the page actually reloading.
  private reloadInFlight = false

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    // A stale-deploy chunk failure is recoverable: fetch the fresh index.html
    // (and valid chunk hashes) by hard-reloading once per session.
    if (isChunkLoadError(error) && !sessionStorage.getItem(RELOAD_FLAG)) {
      sessionStorage.setItem(RELOAD_FLAG, '1')
      this.reloadInFlight = true
      window.location.reload()
    }
  }

  handleReload = () => {
    sessionStorage.removeItem(RELOAD_FLAG)
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    // Render nothing only while the one-shot auto-reload is actually happening.
    // Any other case (non-chunk error, or a chunk error that survived a reload
    // because index.html itself was cached) falls through to the recovery UI —
    // never a silent blank screen.
    if (this.reloadInFlight) return null

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F4F0] dark:bg-[#080808] px-6">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-[#0C0A09] dark:text-white mb-3">
            Something went wrong
          </h1>
          <p className="text-sm text-[#0C0A09]/55 dark:text-white/45 leading-relaxed mb-8">
            The app hit an unexpected error. Reloading usually fixes it — your
            data is safe.
          </p>
          <button
            onClick={this.handleReload}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-[10px] text-sm font-semibold bg-[#0C0A09] dark:bg-white text-white dark:text-[#0C0A09] hover:opacity-85 active:scale-[0.98] transition-all duration-150 cursor-pointer"
          >
            Reload app
          </button>
        </div>
      </div>
    )
  }
}
