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

const tabs: Array<{ id: TabId; icon: typeof Settings2; shortAr: string; shortEn: string }> = [
  { id: 'site', icon: Settings2, shortAr: 'الموقع', shortEn: 'Site' },
  { id: 'services', icon: Sparkles, shortAr: 'المرافق', shortEn: 'Facilities' },
  { id: 'gallery', icon: ImageIcon, shortAr: 'المعرض', shortEn: 'Gallery' },
  { id: 'contact', icon: MapPin, shortAr: 'التواصل', shortEn: 'Contact' },
  { id: 'inbox', icon: MessageSquare, shortAr: 'الوارد', shortEn: 'Inbox' },
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

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-page text-primary">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(0,169,255,0.08),transparent_45%),radial-gradient(ellipse_at_bottom_right,rgba(0,71,171,0.1),transparent_40%)]" />

      <header className="nav-shell sticky top-0 z-40">
        <div className="container-site flex items-center justify-between gap-2 py-2.5 sm:gap-3 sm:py-3">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            {logoSrc ? (
              <img
                key={logoSrc}
                src={logoSrc}
                alt=""
                className="h-8 w-auto max-w-[72px] object-contain sm:h-9 sm:max-w-[96px]"
              />
            ) : (
              <div className="inline-flex rounded-xl bg-brand-gradient p-2 text-white">
                <LayoutDashboard size={16} />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold text-cyan" dir="ltr">
                {BRAND_NAME}
              </p>
              <p className="truncate text-[11px] text-[var(--text-muted)] sm:text-xs">
                {dict.dashboard} · {session.username}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <button
              type="button"
              onClick={signOut}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-red-400/30 bg-red-500/10 px-2.5 text-xs font-semibold text-red-400 sm:px-3"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">{dict.logout}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Desktop / tablet horizontal pill tabs */}
      <div className="container-site hidden pt-4 md:block">
        <nav className="admin-tab-scroll flex gap-2 overflow-x-auto pb-1">
          {tabs.map(({ id, icon: Icon }) => {
            const active = activeTab === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${
                  active
                    ? 'bg-brand-gradient text-white shadow-[0_8px_24px_rgba(0,169,255,0.25)]'
                    : 'glass text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon size={15} />
                {dict.tabs[id]}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="container-site pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-4 md:pb-10 md:pt-5">
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
          <InboxSecurityTab dict={dict} onToast={setToast} onChanged={() => void refreshStats()} />
        ) : null}
      </div>

      {/* Mobile bottom-safe tab bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--nav-border)] bg-[var(--nav-bg)]/95 backdrop-blur-xl md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-5 gap-0.5 px-1 pt-1">
          {tabs.map(({ id, icon: Icon, shortAr, shortEn }) => {
            const active = activeTab === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[10px] font-semibold transition ${
                  active ? 'bg-cyan/15 text-cyan' : 'text-[var(--text-muted)]'
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2.4 : 2} />
                <span className="truncate">{language === 'ar' ? shortAr : shortEn}</span>
              </button>
            )
          })}
        </div>
      </nav>

      <AdminToast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}

export default AdminDashboard
