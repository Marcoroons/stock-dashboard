# Investor Intelligence OS - Design System Documentation

## Overview

The Investor Intelligence OS uses a comprehensive, production-grade design system built for premium financial applications. The system is inspired by Bloomberg, Apple, Notion, and Linear—emphasizing clarity, hierarchy, trust, and minimalism.

## Design Philosophy

- **Premium**: Polished, intentional, sophisticated
- **Data-Focused**: Clear hierarchy for financial information
- **Dark Mode First**: Default to dark, trustworthy aesthetic
- **Minimal**: No unnecessary elements or gradients
- **Accessible**: Keyboard navigation, screen readers, high contrast
- **Responsive**: Mobile-first, works on all devices

## Color System

### Background
- **Primary**: `#09090f` - Main background
- **Secondary**: `#0a0a14` - Sidebar, elevated areas
- **Elevated**: `#0f0f1a` - Cards, surfaces
- **Surface**: `#141425` - Interactive elements
- **Surface 2**: `#1a1a30` - Alternative surface

### Text
- **Primary**: `#f1f5f9` - Main text
- **Secondary**: `#cbd5e1` - Secondary information
- **Tertiary**: `#94a3b8` - Muted text
- **Muted**: `#64748b` - Labels, captions
- **Disabled**: `#334155` - Disabled state

### Status
- **Success**: `#10b981` with `rgba(16,185,129,0.12)` background
- **Warning**: `#f59e0b` with `rgba(245,158,11,0.12)` background
- **Error**: `#ef4444` with `rgba(239,68,68,0.12)` background
- **Info**: `#3b82f6` with `rgba(59,130,246,0.12)` background

### Investment Returns
- **Positive**: `#10b981` (green)
- **Negative**: `#ef4444` (red)
- **Neutral**: `#94a3b8` (gray)

## Typography

### Scales
- **Display**: 48px, 700, -0.02em spacing
- **Hero**: 36px, 700, -0.01em spacing
- **Page Title**: 30px, 700, -0.01em spacing
- **H1**: 24px, 700
- **H2**: 20px, 600
- **H3**: 18px, 600
- **H4**: 16px, 600
- **Body Large**: 16px, 400
- **Body Medium**: 14px, 400
- **Body Small**: 12px, 400
- **Label**: 12px, 600, 0.05em spacing
- **Caption**: 10px, 500, 0.02em spacing

### Fonts
- **Sans**: Inter, SF Pro Display, system fonts
- **Mono**: JetBrains Mono, Fira Code, monospace

## Spacing System

All spacing uses 4px base unit (8px system):
- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `2xl`: 40px
- `3xl`: 48px
- `4xl`: 64px

## Border Radius

- `sm`: 6px
- `md`: 10px (default)
- `lg`: 14px (cards)
- `xl`: 20px
- `2xl`: 28px
- `full`: 99999px

## Component Library

### Core Components

#### Card
The foundation component for all content containers.

```tsx
<Card>Content</Card>
<Card glow>Highlighted card</Card>
```

#### MetricCard
Pre-built component for displaying financial metrics.

```tsx
<MetricCard 
  label="Portfolio Value" 
  value="$142,850" 
  delta="+12.34%" 
/>
```

#### Badge
Lightweight labels with multiple variants.

```tsx
<Badge variant="success">Bullish</Badge>
<Badge variant="warning">Caution</Badge>
<Badge variant="error">Bearish</Badge>
<Badge variant="info">Info</Badge>
<Badge variant="ghost">Neutral</Badge>
```

#### Button
Versatile button component with variants.

```tsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
<Button loading>Loading...</Button>
<Button fullWidth>Full Width</Button>
```

#### Input
Text input with optional icon, error state, and label.

```tsx
<Input label="Email" placeholder="user@example.com" icon={<Mail />} />
<Input error="Invalid value" />
```

#### Progress
Progress bars and score rings for displaying metrics.

```tsx
<ProgressBar value={75} max={100} color="#10b981" />
<ScoreRing score={84} label="Health" />
```

### Premium Components

#### PremiumLock
Exclusive feature lock overlay with upgrade prompt.

```tsx
<PremiumLock 
  tier="pro" 
  title="Advanced Analytics" 
  description="See detailed performance metrics"
  features={["Stress testing", "Risk analysis"]}
>
  {/* Blurred content */}
</PremiumLock>
```

#### PremiumBanner
Feature promotion banner.

```tsx
<PremiumBanner 
  title="Unlock Advanced Features" 
  description="Get stress testing and insider activity data" 
  tier="pro"
  onUpgrade={handleUpgrade}
/>
```

#### AccessCodeInput
Input for applying premium access codes.

```tsx
<AccessCodeInput onSubmit={handleAccessCode} />
```

### Loading & Empty States

#### Skeletons
Prevent layout shift with skeleton loaders.

```tsx
<Skeleton className="h-4 w-48" count={3} />
<DashboardSkeleton />
<PortfolioSkeleton />
```

#### Empty States
Meaningful empty states with contextual CTAs.

```tsx
<NoPortfolioState onCreatePortfolio={handleCreate} />
<NoWatchlistState onAddStocks={handleAdd} />
<EmptyState 
  icon={<Icon />} 
  title="No Data" 
  description="Create content to get started"
  action={{ label: "Create", onClick: handler }}
/>
```

### Data Visualization

#### DataTable
Sortable, responsive table component.

```tsx
<DataTable 
  data={holdings} 
  columns={[
    { key: 'ticker', label: 'Ticker', sortable: true },
    { key: 'price', label: 'Price', render: (v) => `$${v}` },
  ]}
  keyField="id"
  onRowClick={handleRowClick}
/>
```

### System Components

#### Notification/Toast
Non-intrusive alerts at bottom-right corner.

```tsx
const toast = useToast()
toast.success("Changes saved!")
toast.error("Failed to update")
toast.warning("Please review")
toast.info("New feature available")
```

#### Modal/Dialog
Centered modal for confirmations and forms.

```tsx
const { openModal, closeModal } = useModal()
openModal({
  title: "Confirm Action",
  content: <p>Are you sure?</p>,
  actions: [
    { label: "Cancel", onClick: () => closeModal(id) },
    { label: "Confirm", variant: "primary", onClick: handleConfirm },
  ]
})
```

### Investor DNA Components

#### DnaProfileCard
Visual representation of investor profile.

```tsx
<DnaProfileCard 
  profile={{
    emotional: "rational",
    wealth: "growth",
    horizon: "long",
    risk: "moderate",
    score: 76
  }}
/>
```

#### DnaCompatibility
Score display for DNA match percentage.

```tsx
<DnaCompatibility 
  score={82} 
  label="Stock Match" 
  details="Aligns with growth strategy"
/>
```

#### RiskProfileIndicator
Visual indicator of risk tolerance.

```tsx
<RiskProfileIndicator level="moderate" />
```

## Layout System

### AppLayout
Standard layout with sidebar navigation.

```tsx
<AppLayout>
  <Outlet /> {/* Page content */}
</AppLayout>
```

Features:
- Collapsible sidebar
- Top navigation bar with search
- Notification center
- Profile menu
- Mobile responsive

### Responsive Breakpoints

- `xs`: 0px (mobile)
- `sm`: 640px (landscape mobile)
- `md`: 768px (tablet)
- `lg`: 1024px (desktop)
- `xl`: 1280px (wide)
- `2xl`: 1536px (ultra-wide)

## Motion & Transitions

All animations use Framer Motion with consistent timing:

- **Fast**: 150ms
- **Base**: 200ms (default)
- **Slow**: 300ms
- **Slower**: 500ms

Common animations:
- Page transitions: fade-up
- Card hover: scale + shadow
- Expansions: height animation
- Loading: pulse/shimmer

## Accessibility

- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Screen reader labels
- ✅ WCAG AA contrast compliance
- ✅ Focus states on all interactive elements
- ✅ Semantic HTML
- ✅ ARIA attributes where needed

## Usage Examples

### Dashboard Metric Card
```tsx
<MetricCard 
  label="Total Return" 
  value={fmtPct(0.2341)} 
  delta={`+$${fmtBig(24650)}`}
/>
```

### Premium Feature
```tsx
{tier === 'pro' ? (
  <StressTestResults data={data} />
) : (
  <PremiumLock 
    tier="pro"
    title="Stress Testing"
    description="Simulate portfolio performance in market crashes"
    onUpgrade={handleUpgrade}
  >
    <div className="blur-sm"><StressTestResults /></div>
  </PremiumLock>
)}
```

### Data with Empty State
```tsx
{data.length > 0 ? (
  <DataTable data={data} columns={cols} keyField="id" />
) : (
  <NoPortfolioState onCreatePortfolio={handleCreate} />
)}
```

### Toast Notification
```tsx
const toast = useToast()

async function saveChanges() {
  try {
    await api.save(changes)
    toast.success("Changes saved successfully")
  } catch (e) {
    toast.error("Failed to save changes")
  }
}
```

## Design System Files

- `src/theme/tokens.ts` - Design tokens (TypeScript)
- `src/theme/variables.css` - CSS variables
- `src/components/ui/` - UI components
- `src/components/dna/` - DNA-specific components
- `src/components/layout/` - Layout components

## Best Practices

1. **Always use design tokens** - Never hardcode colors, spacing, or sizes
2. **Prefer composition** - Build complex UIs by combining simple components
3. **Handle loading states** - Use skeletons to prevent layout shift
4. **Show empty states** - Never display blank screens
5. **Provide feedback** - Use toasts for user actions
6. **Respect dark mode** - All colors designed for dark backgrounds
7. **Test responsiveness** - Verify on mobile, tablet, desktop

## Future Enhancements

- [ ] Light mode support (if required)
- [ ] Additional chart types (Gantt, Waterfall)
- [ ] Advanced form components (Multi-select, Date picker)
- [ ] Animation presets
- [ ] Component storybook
