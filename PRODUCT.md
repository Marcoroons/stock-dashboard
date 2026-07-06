# Product

## Register

product

<!-- Default register is `product` (the authenticated app: dashboard, portfolio,
assessment, opportunities, settings). Register is decided per-task: the Three.js
marketing LandingPage and other conversion/marketing surfaces are `brand` and
should be treated with the brand reference when worked on directly. -->

## Users

Beginners learning to invest — individuals who are new to markets and are using
Mady Finance to build confidence, not professionals who already have a workflow.
Their context: they arrive uncertain, often anxious about doing the wrong thing
with their money, and they need the product to teach as they go. The primary job
they come to do is **discover and analyze opportunities** — find something to
invest in and understand whether it fits them — supported by portfolio tracking,
investor-DNA risk profiling, and life-goal planning.

## Product Purpose

Mady Finance is a personal investment "operating system" that helps a beginner
go from "I don't know where to start" to making informed, self-directed
decisions. It combines opportunity discovery/analysis, portfolio tracking,
investor-DNA risk profiling, and goal planning into one guided surface. Success
is a first-time investor who understands *why* a decision fits them and acts with
confidence — not more trades, not more time in-app.

## Brand Personality

**Warm, approachable, human.** The voice is a knowledgeable friend who happens to
understand markets — plain-spoken, reassuring, never lecturing. Because the brand
palette is deliberately black/white high-contrast, warmth is carried by **copy,
spacing, generous radii, and tone**, not by soft or pastel color. Approachable
does not mean childish: the product respects that this is the user's real money.

## Anti-references

The interface must NOT feel like any of these:
- **Crypto-bro hype** — neon gradients, "to the moon", urgency/FOMO, gambling energy.
- **Bloomberg-terminal density** — intimidating walls of tickers and numbers that
  overwhelm a beginner. Progressive disclosure over raw density.
- **Childish gamification** — confetti, mascots, Robinhood-style dopamine loops
  that trivialize investing.
- **Generic SaaS template** — cream backgrounds, tracked all-caps eyebrows above
  every section, identical icon-card grids, the hero-metric cliché, anything that
  reads "AI made this."

## Design Principles

1. **Teach in the flow.** Beginners learn by doing — empty states teach the
   interface, guidance is inline at the point of decision, and nothing assumes
   prior fluency. The app is the tutor.
2. **Confidence without condescension.** Reassure and simplify, but never
   trivialize. The user's money is real; warmth is respect, not cartoons.
3. **Clarity over density.** Surface the one signal a beginner needs now; keep
   terminal-grade depth one deliberate click away. Progressive disclosure is the
   default answer to complexity.
4. **Substance over hype.** Credibility comes from honest, grounded framing —
   what fits *you* and why — never from urgency, streaks, or FOMO.
5. **Familiar, not generic.** Lean on conventions beginners already trust
   (standard nav, standard controls), but never the AI-SaaS scaffold. The
   black/white brand carries identity; the layout earns trust by disappearing
   into the task.

## Accessibility & Inclusion

Target **WCAG 2.1 AA**: body text ≥4.5:1 and large text ≥3:1 against its
background (watch the muted-gray-on-tint trap), visible focus states, adequate
target sizes. **Honor `prefers-reduced-motion`** everywhere — especially given
Framer Motion throughout and the Three.js shader on the landing — with a
crossfade or instant fallback for every animation.
