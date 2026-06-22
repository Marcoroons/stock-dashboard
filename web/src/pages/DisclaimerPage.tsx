import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import { ChevronDown, Lock, ShieldCheck, FileText, Globe, Database } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { MadyLogo } from '@/components/ui/MadyLogo'
import { cn } from '@/lib/utils'

interface DisclaimerPageProps {
  onAccept: () => void
}

// ── Accordion ─────────────────────────────────────────────────────────────────

function AccordionItem({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-[#0C0A09]/10 dark:border-white/10 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left cursor-pointer group"
      >
        <span className="text-sm font-semibold text-[#0C0A09] dark:text-white group-hover:opacity-60 transition-opacity duration-150">
          {title}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-[#0C0A09]/35 dark:text-white/35 flex-shrink-0 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-5 space-y-3 text-sm leading-7 text-[#0C0A09]/60 dark:text-white/50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Section wrapper ────────────────────────────────────────────────────────────

function Section({ id, icon: Icon, label, children }: {
  id: string
  icon: React.ElementType
  label: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-28 pt-14 border-t border-[#0C0A09]/8 dark:border-white/8 first:border-0 first:pt-0">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-[#0C0A09]/6 dark:bg-white/6 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-[#0C0A09]/50 dark:text-white/45" />
        </div>
        <h2 className="text-xl font-bold text-[#0C0A09] dark:text-white tracking-tight">
          {label}
        </h2>
      </div>
      {children}
    </section>
  )
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base font-semibold text-[#0C0A09]/85 dark:text-white/80 mt-7 mb-2">
      {children}
    </h3>
  )
}

function Para({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm leading-7 text-[#0C0A09]/60 dark:text-white/50">
      {children}
    </p>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 mt-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm leading-6 text-[#0C0A09]/60 dark:text-white/50">
          <span className="mt-2.5 w-1 h-1 rounded-full bg-[#0C0A09]/25 dark:bg-white/25 flex-shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  )
}

// ── Nav config ────────────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  { id: 'privacy', label: 'Privacy Policy', sub: 'FTC Compliant', icon: ShieldCheck },
  { id: 'terms', label: 'Terms & Conditions', sub: '5 sections', icon: FileText },
  { id: 'data', label: 'Data & Compliance', sub: 'Security & Retention', icon: Database },
  { id: 'international', label: 'International Privacy', sub: 'GDPR · CCPA · APAC', icon: Globe },
]

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - 112
  window.scrollTo({ top, behavior: 'smooth' })
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function DisclaimerPage({ onAccept }: DisclaimerPageProps) {
  const { signOut } = useAuth()
  const [checked, setChecked] = useState(false)
  const [scrolledToBottom, setScrolledToBottom] = useState(false)
  const [activeSection, setActiveSection] = useState('privacy')
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Unlock confirm button once user has scrolled to the bottom sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setScrolledToBottom(true) },
      { threshold: 0.5 },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  // Highlight active sidebar section based on scroll position
  useEffect(() => {
    const sectionEls = NAV_SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean) as HTMLElement[]
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        }
      },
      { rootMargin: '-20% 0px -70% 0px' },
    )
    sectionEls.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const canConfirm = scrolledToBottom && checked

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#F5F4F0] dark:bg-[#080808] text-[#0C0A09] dark:text-white">

        {/* ── Sticky header ─────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-30 bg-[#F5F4F0]/90 dark:bg-[#080808]/90 backdrop-blur-md border-b border-[#0C0A09]/8 dark:border-white/8">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MadyLogo className="w-7 h-7 text-[#0C0A09] dark:text-white opacity-70" />
              <span className="text-xs tracking-[0.22em] uppercase font-light text-[#0C0A09]/50 dark:text-white/40">
                Mady Finance
              </span>
              <span className="hidden sm:block text-[#0C0A09]/20 dark:text-white/15 mx-1 text-lg font-light">/</span>
              <span className="hidden sm:block text-sm font-semibold text-[#0C0A09]/70 dark:text-white/60">
                Legal &amp; Compliance
              </span>
            </div>
            <p className="text-xs text-[#0C0A09]/35 dark:text-white/30">
              Last updated: 21 June 2026
            </p>
          </div>
        </header>

        {/* ── Two-column layout ──────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-6 py-12 lg:flex lg:gap-14 items-start pb-48">

          {/* Left sticky sidebar */}
          <nav className="hidden lg:block w-56 flex-shrink-0 sticky top-28 self-start">
            <p className="text-[10px] tracking-[0.18em] uppercase font-semibold text-[#0C0A09]/30 dark:text-white/25 mb-4">
              Contents
            </p>
            <ul className="space-y-0.5">
              {NAV_SECTIONS.map(s => (
                <li key={s.id}>
                  <button
                    onClick={() => scrollToSection(s.id)}
                    className={cn(
                      'w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 cursor-pointer group',
                      activeSection === s.id
                        ? 'bg-[#0C0A09]/6 dark:bg-white/6'
                        : 'hover:bg-[#0C0A09]/4 dark:hover:bg-white/4',
                    )}
                  >
                    <p className={cn(
                      'text-sm font-medium transition-colors duration-150',
                      activeSection === s.id
                        ? 'text-[#0C0A09] dark:text-white'
                        : 'text-[#0C0A09]/45 dark:text-white/40 group-hover:text-[#0C0A09]/75 dark:group-hover:text-white/65',
                    )}>
                      {s.label}
                    </p>
                    <p className="text-[11px] text-[#0C0A09]/30 dark:text-white/25 mt-0.5">{s.sub}</p>
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-8 p-3 rounded-xl bg-[#0C0A09]/4 dark:bg-white/4 border border-[#0C0A09]/6 dark:border-white/6">
              <p className="text-[11px] leading-5 text-[#0C0A09]/40 dark:text-white/35">
                Read all sections in full before confirming. Your acceptance is legally binding.
              </p>
            </div>
          </nav>

          {/* Right scrollable content */}
          <main className="flex-1 min-w-0 max-w-3xl space-y-0">

            {/* ── 1. Privacy Policy ─────────────────────────────────────────── */}
            <Section id="privacy" icon={ShieldCheck} label="Privacy Policy">
              <Para>
                Mady Finance ("we", "our", or "us") is committed to protecting your personal information and your right to
                privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you
                use our platform, in compliance with the U.S. Federal Trade Commission (FTC) Act and applicable data
                protection laws.
              </Para>

              <SubHeading>Information We Collect</SubHeading>
              <Para>We collect information that you provide directly to us and information we receive when you use the platform:</Para>

              <div className="mt-4 space-y-5">
                <div>
                  <p className="text-sm font-semibold text-[#0C0A09]/75 dark:text-white/65 mb-1.5">Account Information</p>
                  <BulletList items={[
                    'Full name and email address provided at registration',
                    'Encrypted password credentials (we never store plaintext passwords)',
                    'Profile preferences and investor DNA assessment responses',
                  ]} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0C0A09]/75 dark:text-white/65 mb-1.5">Financial Profile Data</p>
                  <BulletList items={[
                    'Portfolio holdings and watchlist data you manually enter',
                    'Investment goals, time horizons, and risk tolerance indicators',
                    'Subscription tier and billing history (processed by our payment provider)',
                  ]} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0C0A09]/75 dark:text-white/65 mb-1.5">Usage &amp; Technical Data</p>
                  <BulletList items={[
                    'Log data including IP address, browser type, pages viewed, and access timestamps',
                    'Device information such as operating system and screen resolution',
                    'Anonymised analytics events for service improvement (no personally identifiable financial data)',
                  ]} />
                </div>
              </div>

              <SubHeading>How We Use Your Information</SubHeading>
              <BulletList items={[
                'To personalise your dashboard, risk assessments, and financial insights',
                'To operate, maintain, and improve the platform and its features',
                'To process your subscription and send receipts and account-related communications',
                'To detect, investigate, and prevent fraudulent transactions and security incidents',
                'To comply with applicable legal obligations and respond to lawful requests',
              ]} />

              <SubHeading>Third-Party Data Sharing</SubHeading>
              <Para>
                We do not sell, trade, or rent your personal information to third parties for marketing purposes.
                We may share your data with trusted service providers under strict data processing agreements:
              </Para>
              <BulletList items={[
                'Stripe, Inc. — for payment processing. Your full payment card details are never stored on our servers.',
                'Supabase, Inc. — for database hosting and authentication infrastructure, operating under industry-standard security certifications.',
                'Security and fraud monitoring services — to protect the integrity of your account.',
              ]} />
              <div className="mt-3">
                <Para>
                  We may disclose information if required to do so by law or in response to valid requests by public
                  authorities (such as a court or government agency).
                </Para>
              </div>
            </Section>

            {/* ── 2. Terms & Conditions ─────────────────────────────────────── */}
            <Section id="terms" icon={FileText} label="Terms &amp; Conditions">
              <Para>
                These Terms &amp; Conditions constitute a legally binding agreement between you and Mady Finance governing
                your access to and use of the platform. By creating an account, you confirm that you have read, understood,
                and agreed to be bound by these terms.
              </Para>

              <div className="mt-6 border border-[#0C0A09]/10 dark:border-white/10 rounded-xl overflow-hidden px-2">
                <AccordionItem title="1. Acceptance of Terms">
                  <p>
                    By accessing or using Mady Finance, you confirm that you are at least 18 years of age, have the legal
                    capacity to enter into binding contracts, and agree to these Terms in their entirety. If you are using
                    the platform on behalf of an organisation, you represent that you have authority to bind that organisation
                    to these Terms.
                  </p>
                  <p>
                    We reserve the right to update these Terms at any time. Continued use of the platform following
                    notification of material changes constitutes your acceptance of the revised Terms. We will notify you
                    of significant changes via email or an in-app notice.
                  </p>
                </AccordionItem>

                <AccordionItem title="2. Not Financial Advice Disclaimer">
                  <p>
                    <strong className="font-semibold text-[#0C0A09]/80 dark:text-white/70">
                      Mady Finance is an educational and analytical tool only. Nothing on this platform constitutes
                      financial, investment, tax, or legal advice.
                    </strong>
                  </p>
                  <p>
                    All portfolio analytics, risk scores, investor DNA assessments, stock data, and market insights are
                    provided for informational and educational purposes only. They do not represent personalised investment
                    recommendations or solicitations to buy or sell any security.
                  </p>
                  <p>
                    Past performance is not indicative of future results. All investments carry risk, including the risk
                    of loss of principal. You should always consult a qualified financial advisor, tax professional, or
                    attorney before making any investment decisions.
                  </p>
                  <p>
                    Mady Finance is not a registered investment advisor, broker-dealer, or financial planner with any
                    regulatory body. Our services are not subject to the Investment Advisers Act of 1940 or equivalent
                    legislation in other jurisdictions.
                  </p>
                </AccordionItem>

                <AccordionItem title="3. User Accounts &amp; Eligibility">
                  <p>
                    You are responsible for maintaining the confidentiality of your account credentials and for all
                    activities that occur under your account. You agree to notify us immediately of any unauthorised use
                    of your account at mhokijanto@gmail.com.
                  </p>
                  <p>You agree not to:</p>
                  <ul className="space-y-1.5 mt-2 pl-0">
                    {[
                      "Share your account credentials with any third party",
                      "Use the platform for any unlawful purpose or in violation of applicable regulations",
                      "Attempt to gain unauthorised access to any other user's account or to our systems",
                      "Reverse engineer, decompile, or otherwise attempt to extract the source code of the platform",
                      "Use automated scripts, bots, or scrapers to access or extract data from the platform",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="mt-2.5 w-1 h-1 rounded-full bg-[#0C0A09]/25 dark:bg-white/25 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3">
                    We reserve the right to suspend or terminate accounts that violate these Terms, with or without prior
                    notice, at our sole discretion.
                  </p>
                </AccordionItem>

                <AccordionItem title="4. Subscription Tiers &amp; Billing">
                  <p>
                    Mady Finance offers subscription plans (Basic, Pro, and Premium) with distinct feature sets.
                    Subscription fees are billed in advance on a monthly or annual basis, depending on the plan selected
                    at checkout.
                  </p>
                  <p>
                    <strong className="font-semibold text-[#0C0A09]/80 dark:text-white/70">Cancellation:</strong>{' '}
                    You may cancel your subscription at any time through your account settings. Cancellation takes effect
                    at the end of the current billing period, and you will retain access to premium features until that
                    date. We do not provide refunds for partial billing periods unless required by applicable law.
                  </p>
                  <p>
                    <strong className="font-semibold text-[#0C0A09]/80 dark:text-white/70">Price Changes:</strong>{' '}
                    We may modify subscription fees at any time. We will provide at least 30 days' advance notice of any
                    price increase, and your continued use of a paid tier after that notice constitutes acceptance of the
                    new pricing.
                  </p>
                  <p>
                    All transactions are processed securely by Stripe, Inc. Mady Finance does not store complete payment
                    card numbers on its servers.
                  </p>
                </AccordionItem>

                <AccordionItem title="5. Limitation of Liability">
                  <p>
                    To the maximum extent permitted by applicable law, Mady Finance and its officers, directors,
                    employees, and agents shall not be liable for any indirect, incidental, special, consequential,
                    or punitive damages, including but not limited to loss of profits, loss of data, loss of goodwill,
                    service interruption, or the cost of substitute services, even if advised of the possibility of
                    such damages.
                  </p>
                  <p>
                    Our aggregate liability to you for any claim arising out of or relating to these Terms or your use
                    of the platform shall not exceed the greater of (a) the total fees you paid to Mady Finance in the
                    12 months preceding the claim or (b) USD $100.
                  </p>
                  <p>
                    The platform is provided on an "as is" and "as available" basis without warranties of any kind,
                    either express or implied, including but not limited to implied warranties of merchantability,
                    fitness for a particular purpose, or non-infringement. We do not warrant that the platform will be
                    uninterrupted, error-free, or free of viruses or other harmful components.
                  </p>
                  <p>
                    Some jurisdictions do not allow the exclusion of implied warranties or limitations of liability,
                    so the above limitations may not apply to you in full.
                  </p>
                </AccordionItem>
              </div>
            </Section>

            {/* ── 3. Data & Compliance ──────────────────────────────────────── */}
            <Section id="data" icon={Database} label="Data &amp; Compliance">
              <Para>
                We apply institutional-grade data engineering practices to protect the confidentiality, integrity, and
                availability of your information. This section describes our technical and organisational security measures,
                along with our data retention commitments.
              </Para>

              <SubHeading>Architectural Integrity &amp; Security</SubHeading>
              <Para>
                <strong className="font-semibold text-[#0C0A09]/75 dark:text-white/65">Encryption in Transit &amp; At Rest: </strong>
                All data transmitted between your device and our servers is encrypted using TLS 1.2 or higher. Sensitive
                data at rest, including authentication tokens and personal identifiers, is encrypted using AES-256. Our
                database infrastructure is hosted on Supabase, which operates under SOC 2 Type II and ISO 27001
                certification frameworks.
              </Para>
              <div className="mt-3">
                <Para>
                  <strong className="font-semibold text-[#0C0A09]/75 dark:text-white/65">Access Control: </strong>
                  Access to production systems and user data is restricted on a strict need-to-know basis using role-based
                  access control (RBAC). All administrative actions are logged and subject to regular audit. We enforce
                  multi-factor authentication (MFA) for all internal system access. We do not allow employees to access
                  individual user data except as strictly necessary to resolve a verified support request, investigate
                  security incidents, or comply with legal obligations.
                </Para>
              </div>

              <SubHeading>Data Retention Protocol</SubHeading>
              <Para>
                <strong className="font-semibold text-[#0C0A09]/75 dark:text-white/65">Active Accounts: </strong>
                We retain your personal data and usage logs for as long as your account is active or as needed to provide
                our services. We may retain certain aggregated, anonymised analytics data indefinitely for product
                improvement purposes, as such data cannot be used to identify you.
              </Para>
              <div className="mt-3">
                <Para>
                  <strong className="font-semibold text-[#0C0A09]/75 dark:text-white/65">Account Deletion: </strong>
                  Upon your request to delete your account, we will permanently delete your personal data from our active
                  systems within 30 days. Certain residual data may be retained in encrypted backup archives for up to
                  90 days to comply with our disaster recovery obligations, after which it is permanently purged. Financial
                  transaction records may be retained for up to 7 years as required by applicable tax and anti-money
                  laundering regulations, even following account deletion.
                </Para>
              </div>
              <div className="mt-3">
                <Para>
                  You may submit a data deletion request at any time by contacting us at{' '}
                  <a
                    href="mailto:mhokijanto@gmail.com"
                    className="font-semibold text-[#0C0A09]/80 dark:text-white/70 underline underline-offset-2 hover:opacity-60 transition-opacity"
                  >
                    mhokijanto@gmail.com
                  </a>
                  .
                </Para>
              </div>
            </Section>

            {/* ── 4. International Privacy ──────────────────────────────────── */}
            <Section id="international" icon={Globe} label="International Privacy &amp; Data Compliance">
              <Para>
                Mady Finance serves users globally and is committed to complying with applicable data protection laws
                across all jurisdictions in which we operate. The following provisions supplement our Privacy Policy and
                apply specifically to residents of the relevant territories.
              </Para>

              <div className="mt-6 border border-[#0C0A09]/10 dark:border-white/10 rounded-xl overflow-hidden px-2">
                <AccordionItem title="European Union & United Kingdom — GDPR">
                  <p>
                    If you are located in the European Economic Area (EEA) or the United Kingdom, your personal data is
                    processed in accordance with the EU General Data Protection Regulation (EU 2016/679) and the UK GDPR,
                    as retained in UK law by the European Union (Withdrawal) Act 2018.
                  </p>
                  <p>
                    <strong className="font-semibold text-[#0C0A09]/80 dark:text-white/70">Legal Basis for Processing:</strong>
                    {' '}We process your data under the following lawful bases:
                  </p>
                  <ul className="mt-2 space-y-1.5 pl-0">
                    {[
                      'Contract Performance (Art. 6(1)(b)) — processing necessary to provide the platform services you have subscribed to',
                      'Legitimate Interests (Art. 6(1)(f)) — security monitoring, fraud prevention, and service improvement',
                      'Legal Obligation (Art. 6(1)(c)) — compliance with financial record-keeping and anti-money laundering laws',
                      'Consent (Art. 6(1)(a)) — for optional marketing communications, which you may withdraw at any time',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="mt-2.5 w-1 h-1 rounded-full bg-[#0C0A09]/25 dark:bg-white/25 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3">
                    <strong className="font-semibold text-[#0C0A09]/80 dark:text-white/70">International Transfers:</strong>
                    {' '}Where we transfer your personal data outside the EEA/UK, we do so under Standard Contractual
                    Clauses (SCCs) approved by the European Commission, or equivalent transfer mechanisms, to ensure your
                    data receives equivalent protection.
                  </p>
                  <p>
                    <strong className="font-semibold text-[#0C0A09]/80 dark:text-white/70">Data Protection Officer:</strong>
                    {' '}Where required by GDPR, we have appointed a Data Protection contact reachable at{' '}
                    <span className="font-semibold text-[#0C0A09]/75 dark:text-white/65">mhokijanto@gmail.com</span>.
                    {' '}You have the right to lodge a complaint with your local supervisory authority (e.g., the ICO in
                    the UK, or the relevant EU Data Protection Authority).
                  </p>
                </AccordionItem>

                <AccordionItem title="United States — California CCPA / CPRA">
                  <p>
                    If you are a California resident, you have specific rights under the California Consumer Privacy Act
                    (CCPA) as amended by the California Privacy Rights Act (CPRA). This section supplements our Privacy
                    Policy for California residents specifically.
                  </p>
                  <p>
                    <strong className="font-semibold text-[#0C0A09]/80 dark:text-white/70">Categories of Personal Information Collected:</strong>
                  </p>
                  <ul className="mt-2 space-y-1.5 pl-0">
                    {[
                      'Identifiers (name, email address, IP address)',
                      'Commercial information (subscription history and transaction records)',
                      'Internet or electronic network activity (usage logs, device data)',
                      'Financial information for billing purposes (processed by Stripe, not stored by us)',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="mt-2.5 w-1 h-1 rounded-full bg-[#0C0A09]/25 dark:bg-white/25 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3">
                    <strong className="font-semibold text-[#0C0A09]/80 dark:text-white/70">Your CCPA Rights:</strong>
                    {' '}You have the right to know what personal information we collect and how it is used, to delete your
                    personal information (subject to certain exceptions), to opt out of the sale or sharing of personal
                    information (we do not sell your data), and to non-discrimination for exercising your privacy rights.
                  </p>
                  <p>
                    To exercise any of these rights, contact us at{' '}
                    <span className="font-semibold text-[#0C0A09]/75 dark:text-white/65">mhokijanto@gmail.com</span>.
                    {' '}We will respond to verified requests within 45 days as required by the CCPA.
                  </p>
                </AccordionItem>

                <AccordionItem title="Asia-Pacific — Singapore, Malaysia & Indonesia">
                  <p>
                    <strong className="font-semibold text-[#0C0A09]/80 dark:text-white/70">Singapore (PDPA 2012):</strong>
                    {' '}For users in Singapore, we comply with the Personal Data Protection Act 2012 (PDPA). We collect,
                    use, and disclose personal data only for purposes that a reasonable person would consider appropriate
                    in the circumstances. We implement reasonable security arrangements to prevent unauthorised access,
                    collection, use, disclosure, copying, modification, disposal, or similar risks. You have the right
                    to access and correct your personal data held by us.
                  </p>
                  <p>
                    <strong className="font-semibold text-[#0C0A09]/80 dark:text-white/70">Malaysia (PDPA 2010):</strong>
                    {' '}For users in Malaysia, we comply with the Personal Data Protection Act 2010. We process your
                    personal data in accordance with the seven data protection principles: General, Notice and Choice,
                    Disclosure, Security, Retention, Data Integrity, and Access. You have the right to access your
                    personal data, to correct inaccurate data, and to withdraw consent, subject to any legal or
                    contractual restrictions.
                  </p>
                  <p>
                    <strong className="font-semibold text-[#0C0A09]/80 dark:text-white/70">Indonesia (PDP Law 2022):</strong>
                    {' '}For users in Indonesia, we comply with Law No. 27 of 2022 on Personal Data Protection (UU PDP).
                    As a personal data controller, we implement appropriate technical and organisational measures to
                    protect your personal data and process it only for specific, explicit, and legitimate purposes. You
                    have the right to receive information about, access, and correct your personal data, as well as the
                    right to withdraw consent and request deletion.
                  </p>
                </AccordionItem>

                <AccordionItem title="Exercising Your Compliance Rights">
                  <p>
                    Regardless of your jurisdiction, we are committed to facilitating the exercise of your data subject
                    rights. Depending on applicable law, you may be entitled to:
                  </p>
                  <ul className="mt-2 space-y-1.5 pl-0">
                    {[
                      'Right of Access — request a copy of the personal data we hold about you',
                      'Right to Rectification — request correction of inaccurate or incomplete data',
                      'Right to Erasure — request deletion of your personal data where there is no compelling reason for its continued processing',
                      'Right to Restriction of Processing — request that we limit the processing of your data in certain circumstances',
                      'Right to Data Portability — receive your data in a structured, commonly used, machine-readable format',
                      'Right to Object — object to processing based on legitimate interests or for direct marketing purposes',
                      'Right to Withdraw Consent — withdraw any consent previously given at any time without affecting the lawfulness of prior processing',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="mt-2.5 w-1 h-1 rounded-full bg-[#0C0A09]/25 dark:bg-white/25 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3">
                    To submit a data subject rights request, please contact our privacy team at{' '}
                    <a
                      href="mailto:mhokijanto@gmail.com"
                      className="font-semibold text-[#0C0A09]/80 dark:text-white/70 underline underline-offset-2 hover:opacity-60 transition-opacity"
                    >
                      mhokijanto@gmail.com
                    </a>
                    {' '}with the subject line "Privacy Rights Request — [Your Jurisdiction]". We will verify your
                    identity before processing any request and aim to respond within the timeframe required by your
                    applicable law (typically 30–45 days). We do not charge a fee for making a rights request unless
                    requests are manifestly unfounded, excessive, or repetitive.
                  </p>
                </AccordionItem>
              </div>

              {/* Governing law footer note */}
              <div className="mt-8 p-5 rounded-xl bg-[#0C0A09]/4 dark:bg-white/4 border border-[#0C0A09]/8 dark:border-white/8">
                <p className="text-xs leading-6 text-[#0C0A09]/45 dark:text-white/40">
                  <strong className="font-semibold text-[#0C0A09]/60 dark:text-white/55">Governing Law: </strong>
                  These Terms and your use of Mady Finance are governed by and construed in accordance with the laws of
                  the jurisdiction in which Mady Finance is incorporated, without regard to conflict of law principles.
                  Any disputes shall be subject to the exclusive jurisdiction of the courts of that jurisdiction, unless
                  mandatory local law provides otherwise.
                </p>
                <p className="text-xs leading-6 text-[#0C0A09]/45 dark:text-white/40 mt-2">
                  For all legal inquiries and data protection correspondence:{' '}
                  <a
                    href="mailto:mhokijanto@gmail.com"
                    className="font-semibold text-[#0C0A09]/60 dark:text-white/55 underline underline-offset-2 hover:opacity-70 transition-opacity"
                  >
                    mhokijanto@gmail.com
                  </a>
                </p>
              </div>
            </Section>

            {/* Bottom sentinel — IntersectionObserver triggers confirm unlock */}
            <div ref={sentinelRef} className="h-px mt-10" aria-hidden />
          </main>
        </div>

        {/* ── Fixed bottom confirmation bar ──────────────────────────────────── */}
        <div className="fixed bottom-0 inset-x-0 z-40 bg-[#F5F4F0]/95 dark:bg-[#080808]/95 backdrop-blur-md border-t border-[#0C0A09]/10 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center gap-4 justify-between">

            {/* Left: lock message or checkbox */}
            <AnimatePresence mode="wait">
              {!scrolledToBottom ? (
                <motion.div
                  key="locked"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-2.5"
                >
                  <Lock className="w-3.5 h-3.5 text-[#0C0A09]/30 dark:text-white/25 flex-shrink-0" />
                  <p className="text-sm text-[#0C0A09]/45 dark:text-white/35">
                    <span className="hidden sm:inline">Scroll to the end of all sections to confirm your acceptance.</span>
                    <span className="sm:hidden">Scroll to bottom to confirm.</span>
                  </p>
                </motion.div>
              ) : (
                <motion.label
                  key="checkbox"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-3 cursor-pointer group select-none"
                >
                  <div className="relative flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={e => setChecked(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={cn(
                        'w-5 h-5 rounded border-2 transition-all duration-150 flex items-center justify-center',
                        checked
                          ? 'bg-[#0C0A09] dark:bg-white border-[#0C0A09] dark:border-white'
                          : 'bg-transparent border-[#0C0A09]/30 dark:border-white/30 group-hover:border-[#0C0A09]/60 dark:group-hover:border-white/55',
                      )}
                    >
                      {checked && (
                        <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 text-white dark:text-[#0C0A09]" fill="none">
                          <path
                            d="M1 4l2.5 2.5L9 1"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-[#0C0A09]/60 dark:text-white/50 group-hover:text-[#0C0A09]/80 dark:group-hover:text-white/70 transition-colors duration-150">
                    <span className="hidden sm:inline">I have read and agree to the Privacy Policy, Terms &amp; Conditions, and all applicable compliance provisions.</span>
                    <span className="sm:hidden">I have read and agree to all terms.</span>
                  </span>
                </motion.label>
              )}
            </AnimatePresence>

            {/* Right: action buttons */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <button
                onClick={() => signOut()}
                className={cn(
                  'px-4 py-2 rounded-[10px] text-sm font-medium transition-all duration-150 cursor-pointer',
                  'border border-[#0C0A09]/15 dark:border-white/15 text-[#0C0A09]/50 dark:text-white/40',
                  'hover:border-[#0C0A09]/30 dark:hover:border-white/30 hover:text-[#0C0A09]/75 dark:hover:text-white/65',
                )}
              >
                Sign out
              </button>

              <button
                onClick={canConfirm ? onAccept : undefined}
                disabled={!canConfirm}
                className={cn(
                  'px-5 py-2 rounded-[10px] text-sm font-semibold transition-all duration-200',
                  canConfirm
                    ? 'bg-[#0C0A09] dark:bg-white text-white dark:text-[#0C0A09] hover:opacity-85 cursor-pointer active:scale-[0.98]'
                    : 'bg-[#0C0A09]/10 dark:bg-white/10 text-[#0C0A09]/28 dark:text-white/22 cursor-not-allowed',
                )}
              >
                Confirm &amp; Continue
              </button>
            </div>
          </div>
        </div>

      </div>
    </MotionConfig>
  )
}
