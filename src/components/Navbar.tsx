import { Menu, X } from 'lucide-react'
import { useEffect, useState, type FC } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { getPublicCopy } from '../i18n/public'
import BrandLogo from './BrandLogo'
import LanguageToggle from './LanguageToggle'
import ThemeToggle from './ThemeToggle'

const links = [
  { href: '#home', key: 'home' as const },
  { href: '#about', key: 'about' as const },
  { href: '#services', key: 'services' as const },
  { href: '#gallery', key: 'gallery' as const },
  { href: '#contact', key: 'contact' as const },
]

const Navbar: FC = () => {
  const { language } = useLanguage()
  const t = getPublicCopy(language)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="nav-shell fixed inset-x-0 top-0 z-50">
      <div className="container-site flex h-16 items-center justify-between gap-3 sm:h-[4.25rem]">
        <BrandLogo />
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-xl px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-cyan"
            >
              {t[item.key]}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <a
            href="#contact"
            className="hidden min-h-11 items-center rounded-xl bg-brand-gradient px-4 text-sm font-bold text-white sm:inline-flex"
          >
            {t.cta}
          </a>
          <button
            type="button"
            className="nav-control inline-flex h-11 w-11 items-center justify-center rounded-xl lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close' : 'Menu'}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-[var(--nav-border)] bg-[var(--nav-bg)] px-4 py-4 lg:hidden">
          {links.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-3 text-sm font-semibold"
            >
              {t[item.key]}
            </a>
          ))}
        </div>
      ) : null}
    </header>
  )
}

export default Navbar
