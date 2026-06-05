# Component Registry

All reusable UI components, layout components, and feature components in the application.

---

## UI Components (`src/components/ui/`)

### Button (`Button.tsx`)

```tsx
<Button
  variant="primary" | "secondary" | "ghost"
  size="sm" | "md" | "lg"
  fullWidth?: boolean
  disabled?: boolean
  onClick?: () => void
>
```

Standard button with three visual variants. Uses `cva` for variant composition.

---

### Input (`Input.tsx`)

```tsx
<Input
  label?: string
  error?: string
  icon?: React.ReactNode
  placeholder?: string
  // + all native <input> props
/>
```

Labeled text input with optional left icon and inline error message.

---

### Card / MetricCard (`Card.tsx`)

```tsx
<Card className? hover? glass?>
<MetricCard label value subValue change changeType="positive"|"negative"|"neutral" />
```

`Card` is a simple dark container. `MetricCard` is a pre-structured KPI tile with label, primary value, and optional delta badge.

---

### Badge (`Badge.tsx`)

```tsx
<Badge variant="default"|"success"|"warning"|"error"|"info"|"ghost" size="sm"|"md">
```

Inline status pill. Variants map to semantic colors (green success, amber warning, red error, blue info).

---

### Progress (`Progress.tsx`)

```tsx
<ProgressBar value={0–100} color? size="sm"|"md"|"lg" animated? />
<ScoreRing score={0–100} size? color? label? sublabel? />
```

`ProgressBar` is a horizontal fill bar. `ScoreRing` is an animated SVG arc used for score displays throughout the app (Portfolio Doctor, Stress Test, DNA, etc.).

---

### Skeleton / LoadingSpinner (`Skeleton.tsx`)

```tsx
<LoadingSpinner size="sm"|"md"|"lg" />
<Skeleton className? />
<CardSkeleton />
<TableSkeleton rows? />
<ChartSkeleton />
<DashboardSkeleton />
<PortfolioSkeleton />
<StockAnalysisSkeleton />
```

Pulse-animated placeholder shapes for loading states. `LoadingSpinner` is a rotating ring.

---

### EmptyState (`EmptyState.tsx`)

```tsx
<EmptyState title description icon? action? />
<NoPortfolioState />
<NoWatchlistState />
<NoOpportunitiesState />
<NoNewsState />
<NoEducationState />
<ErrorState message? onRetry? />
```

Centered empty/error state with icon, title, description, and optional CTA button. Pre-composed variants for common pages.

---

### Toast / NotificationProvider (`Toast.tsx`)

```tsx
// Provider (wraps app root)
<NotificationProvider>

// Hooks
const { toast } = useToast()
toast({ type: "success"|"error"|"warning"|"info", message: string, duration?: number })

const { notify } = useNotification()
```

Stack-based toast system anchored to the bottom-right. Auto-dismisses after `duration` ms.

---

### Modal / ModalProvider (`Modal.tsx`)

```tsx
// Provider (wraps app root)
<ModalProvider>

// Hook
const { openModal, closeModal } = useModal()
const { confirm, alert } = useDialog()
```

Managed modal system. `useDialog()` provides pre-built confirm/alert dialogs.

---

### DataTable / FinancialTable (`DataTable.tsx`)

```tsx
<DataTable
  columns={ColumnDef<T>[]}
  data={T[]}
  loading?: boolean
  onRowClick?: (row: T) => void
/>

<FinancialTable
  columns={ColumnDef<T>[]}
  data={T[]}
/>
```

Reusable sortable table. `ColumnDef<T>` specifies `key`, `header`, `render?`, `sortable?`, `align?`. `FinancialTable` is a variant with compact financial row styling.

---

### UpgradeModal / AccessCodeModal / FeatureGate (`UpgradeModal.tsx`)

```tsx
<UpgradeModal
  targetTier="plus"|"pro"
  feature?: keyof FeatureAccess
  onClose={() => void}
  onCheckout={(tier) => Promise<void>}
  onAccessCode={() => void}
  isLoading: boolean
/>

<AccessCodeModal
  onClose={() => void}
  onRedeem={(code) => Promise<{ success, error?, tier? }>}
/>

<FeatureGate
  feature: keyof FeatureAccess
  hasAccess: boolean
  onUpgrade: (feature) => void
  children?: ReactNode          // shown when hasAccess = true
  blurPreview?: ReactNode       // blurred behind the lock overlay
/>
```

`UpgradeModal` — contextual upgrade dialog with plan price, early-bird badge, feature list, and Stripe checkout CTA.
`AccessCodeModal` — code redemption dialog with uppercase normalization and success/error states.
`FeatureGate` — either renders `children` (when `hasAccess`) or renders a lock overlay with plan info. Blurred `blurPreview` is optional.

All three are rendered globally by `SubscriptionProvider` — pages do not need to mount them directly.

---

### PremiumLock / PremiumBadge / PremiumBanner / AccessCodeInput (`Premium.tsx`)

```tsx
<PremiumLock feature? tier? />
<PremiumBadge tier="plus"|"pro" />
<PremiumBanner tier message onUpgrade />
<AccessCodeInput onRedeem />
```

Lighter-weight premium UI fragments used in cards and section headers. Distinct from `FeatureGate` (which gates full pages).

---

## Layout Components (`src/components/layout/`)

### AppLayout (`AppLayout.tsx`)

Root shell for all authenticated routes. Renders:
- Desktop `<Sidebar>` (collapsible, `lg:` breakpoint)
- Mobile `<MobileSidebar>` (slide-in drawer)
- Top navigation bar (search input, bell icon with unread count, avatar)
- `<Outlet>` for page content
- `<PageTracker>` — invisible component that fires `track('page_viewed')` on every route change

Props: none (reads from `useAuth`, `useAlerts`).

---

### Sidebar (`Sidebar.tsx`)

```tsx
<Sidebar collapsed: boolean onToggle: () => void />
<MobileSidebar open: boolean onClose: () => void />
```

**Sidebar** — collapsible desktop nav. When collapsed to 64 px, only icons are shown. When expanded to 220 px, labels + badges appear.

Contains:
- Logo + collapse toggle
- Tier badge (shows current plan with upgrade link)
- DNA Profile quick-link
- `NAV_ITEMS_FIXED` navigation links (15 routes) with:
  - Active highlight
  - Unread alerts badge
  - Tier lock badge (Plus/Pro label on locked items)
- Admin link (only when `profile.is_admin = true`)
- Settings + Sign out

**MobileSidebar** — full-width drawer (`AnimatePresence` slide). Closes on link click or backdrop tap.

---

## DNA Components (`src/components/dna/`)

### DnaComponents (`DnaComponents.tsx`)

Internal components for the DNA Profile page. Includes archetype visualization cards, score breakdown bars, and compatibility matrices. Used exclusively by `DnaProfilePage`.

---

## Admin Sub-Pages (`src/pages/admin/`)

Not components in the shared sense — these are route-level page sections mounted inside `AdminPage`. They follow the same pattern: fetch on mount, render table or chart.

| File | Renders |
|---|---|
| `AdminOverview.tsx` | KPI cards + 30-day signup bar chart + feature usage horizontal bar chart |
| `AdminUsers.tsx` | Searchable table of all profiles |
| `AdminSubscriptions.tsx` | Subscriptions table with status + renewal date |
| `AdminCodes.tsx` | Access codes table + create form |
| `AdminAnalytics.tsx` | Top events chart + 14-day DAU chart + live event stream |

---

## Design Tokens

Base values in `theme/tokens.ts` and `theme/variables.css`.

| Token | Value |
|---|---|
| Background base | `#09090f` |
| Surface | `#0a0a14` |
| Surface elevated | `#0f0f1a` |
| Border | `#1e1e3a` |
| Text primary | `#f1f5f9` |
| Text secondary | `#94a3b8` |
| Text muted | `#64748b` |
| Text faintest | `#475569` |
| Accent blue | `#3b82f6` |
| Tier Plus | `#06b6d4` |
| Tier Pro | `#f59e0b` |
| Success | `#10b981` |
| Error | `#ef4444` |
| Warning | `#f59e0b` |

All dynamic tier-based colors are applied via inline `style` props rather than Tailwind classes, to support computed values.
