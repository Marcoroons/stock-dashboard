export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ')
}

export function fmt(x: number | null | undefined, decimals = 2): string {
  if (x == null) return 'n/a'
  return x.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export function fmtPct(x: number | null | undefined, decimals = 1): string {
  if (x == null) return 'n/a'
  return `${x >= 0 ? '+' : ''}${(x * 100).toFixed(decimals)}%`
}

export function fmtBig(x: number | null | undefined): string {
  if (x == null) return 'n/a'
  const abs = Math.abs(x)
  const sign = x < 0 ? '-' : ''
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(2)}T`
  if (abs >= 1e9)  return `${sign}${(abs / 1e9).toFixed(2)}B`
  if (abs >= 1e6)  return `${sign}${(abs / 1e6).toFixed(2)}M`
  if (abs >= 1e3)  return `${sign}${(abs / 1e3).toFixed(1)}K`
  return `${sign}${abs.toFixed(2)}`
}

export function fmtCurrency(x: number | null | undefined, currency = 'USD'): string {
  if (x == null) return 'n/a'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(x)
}

export function colorClass(value: number | null | undefined): string {
  if (value == null) return 'neu'
  if (value > 0) return 'pos'
  if (value < 0) return 'neg'
  return 'neu'
}

export function formatDate(d: string | Date): string {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
