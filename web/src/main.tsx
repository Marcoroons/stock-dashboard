import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// When a lazy chunk fails to preload (stale index.html after a new deploy),
// Vite fires this event. Reload once to fetch the fresh manifest + valid hashes.
window.addEventListener('vite:preloadError', () => {
  if (!sessionStorage.getItem('mady_chunk_reloaded')) {
    sessionStorage.setItem('mady_chunk_reloaded', '1')
    window.location.reload()
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
