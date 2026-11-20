import {
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageSquare,
  Settings2,
  Sparkles,
} from 'lucide-react'
import { useCallback, useEffect, useState, type FC } from 'react'
import LanguageToggle from '../components/LanguageToggle'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { BRAND_NAME } from '../data/content'
import { supabase } from '../lib/supabase'
import { withCacheBust } from '../utils/mediaUrl'
import AdminLogin from './AdminLogin'
import AdminToast, { type ToastState } from './components/AdminToast'
import StatsCards from './components/StatsCards'
import { getAdminDict } from './i18n'
import ContactTab from './tabs/ContactTab'
import GalleryTab from './tabs/GalleryTab'
import InboxSecurityTab from './tabs/InboxSecurityTab'
import ServicesTab from './tabs/ServicesTab'
import SiteSettingsTab from './tabs/SiteSettingsTab'

type TabId = 'site' | 'services' | 'gallery' | 'contact' | 'inbox'

const tabs: Array<{ id: TabId; icon: typeof Settings2 }> = [
  { id: 'site', icon: Settings2 },
  { id: 'services', icon: Sparkles },
  { id: 'gallery', icon: ImageIcon },
  { id: 'contact', icon: MapPin },
  { id: 'inbox', icon: MessageSquare },
]

const AdminDashboard: FC = () => {
  const { language } = useLanguage()
  const dict = getAdminDict(language)
  const { session, loading, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>('site')
  const [toast, setToast] = useState<ToastState>(null)
  const [facilities, setFacilities] = useState(0)
  const [galleryCount, setGalleryCount] = useState(0)
  const [unread, setUnread] = useState(0)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoBust, setLogoBust] = useState(() => Date.now())

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const refreshStats = useCallback(async () => {
    const [servicesRes, galleryRes, messagesRes, settingsRes] = await Promise.all([
      supabase.from('services').select('id', { count: 'exact', head: true }),
      supabase.from('gallery_items').select('id', { count: 'exact', head: true }),
      supabase
        .from('contact_messages')
        .select('id', { count: 'exact', head: true })
        .eq('is_read', false),
      supabase.from('site_settings').select('updated_at, logo_url').eq('id', 1).maybeSingle(),
    ])

    setFacilities(servicesRes.count ?? 0)
    setGalleryCount(galleryRes.count ?? 0)
    setUnread(messagesRes.count ?? 0)
    const row = settingsRes.data as { updated_at?: string; logo_url?: string | null } | null
    setLastUpdated(row?.updated_at ?? null)
    setLogoUrl(row?.logo_url?.trim() || null)
    setLogoBust(Date.now())
  }, [])

  useEffect(() => {
    if (!session) return
    void refreshStats()
  }, [session, refreshStats, activeTab])

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center overflow-x-hidden bg-page text-primary">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan border-t-transparent" />
      </div>
    )
  }

  if (!session) return <AdminLogin />

  const logoSrc = logoUrl ? withCacheBust(logoUrl, logoBust) : ''

  const brandBlock = (
    <div className="flex min-w-0 items-center gap-3">
      {logoSrc ? (
        <img
          key={logoSrc}
          src={logoSrc}
          alt=""
          className="h-9 w-auto max-w-[88px] object-contain"
        />
      ) : (
        <div className="inline-flex rounded-xl bg-brand-gradient p-2.5 text-white">
          <LayoutDashboard size={18} />
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate font-display text-sm font-semibold text-cyan" dir="ltr">
          {BRAND_NAME}
        </p>
        <p className="truncate text-xs text-[var(--text-muted)]">
          {dict.dashboard} · {session.username}
        </p>
      </div>
    </div>
  )

  const tabButtons = (variant: 'sidebar' | 'scroll') =>
    tabs.map(({ id, icon: Icon }) => {
      const active = activeTab === id
      if (variant === 'sidebar') {
        return (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3.5 text-start text-sm font-semibold transition ${
              active
                ? 'bg-brand-gradient text-white shadow-[0_8px_24px_rgba(0,169,255,0.22)]'
                : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]'
            }`}
          >
            <Icon size={17} />
            <span className="truncate">{dict.tabs[id]}</span>
          </button>
        )
      }
      return (
        <button
          key={id}
          type="button"
          onClick={() => setActiveTab(id)}
          className={`inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${
            active
              ? 'bg-brand-gradient text-white'
              : 'border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-secondary)]'
          }`}
        >
          <Icon size={15} />
          {dict.tabs[id]}
        </button>
      )
    })

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-page text-primary">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(0,169,255,0.07),transparent_45%),radial-gradient(ellipse_at_bottom_right,rgba(0,71,171,0.09),transparent_40%)]" />

      {/* Mobile top bar */}
      <header className="nav-shell sticky top-0 z-40 lg:hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          {brandBlock}
          <div className="flex shrink-0 items-center gap-1.5">
            <LanguageToggle />
            <ThemeToggle />
            <button
              type="button"
              onClick={signOut}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-red-400/30 bg-red-500/10 text-red-400"
              aria-label={dict.logout}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
        <div className="admin-tab-scroll flex gap-2 overflow-x-auto border-t border-[var(--nav-border)] px-4 py-2.5">
          {tabButtons('scroll')}
        </div>
      </header>

      <div className="lg:flex lg:min-h-dvh">
        {/* Desktop sidebar */}
        <aside className="nav-shell sticky top-0 hidden h-dvh w-72 shrink-0 flex-col border-e border-[var(--nav-border)] lg:flex">
          <div className="border-b border-[var(--nav-border)] px-5 py-5">{brandBlock}</div>
          <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-4">
            {tabButtons('sidebar')}
          </nav>
          <div className="space-y-3 border-t border-[var(--nav-border)] px-4 py-4">
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 text-sm font-semibold text-red-400"
            >
              <LogOut size={15} />
              {dict.logout}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-6xl space-y-6">
            <StatsCards
              dict={dict}
              facilities={facilities}
              gallery={galleryCount}
              unread={unread}
              lastUpdated={lastUpdated}
              language={language}
            />

            {activeTab === 'site' ? (
              <SiteSettingsTab dict={dict} onToast={setToast} onSaved={() => void refreshStats()} />
            ) : null}
            {activeTab === 'services' ? (
              <ServicesTab dict={dict} onToast={setToast} onChanged={() => void refreshStats()} />
            ) : null}
            {activeTab === 'gallery' ? (
              <GalleryTab dict={dict} onToast={setToast} onChanged={() => void refreshStats()} />
            ) : null}
            {activeTab === 'contact' ? (
              <ContactTab dict={dict} onToast={setToast} onSaved={() => void refreshStats()} />
            ) : null}
            {activeTab === 'inbox' ? (
              <InboxSecurityTab
                dict={dict}
                onToast={setToast}
                onChanged={() => void refreshStats()}
              />
            ) : null}
          </div>
        </main>
      </div>

      <AdminToast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}

export default AdminDashboard
