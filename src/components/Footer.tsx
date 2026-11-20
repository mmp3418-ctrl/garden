import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useSite } from '../context/SiteDataContext'
import { BRAND_NAME } from '../data/content'
import { getPublicCopy } from '../i18n/public'
import BrandLogo from './BrandLogo'

const Footer: FC = () => {
  const { language } = useLanguage()
  const t = getPublicCopy(language)
  const { settings } = useSite()
  const year = new Date().getFullYear()
  const email = settings.email?.trim() || 'info@garden-city.com.ly'

  return (
    <footer className="border-t border-[var(--glass-border)] bg-[var(--bg-elevated)]/80">
      <div className="container-site section-pad !py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <BrandLogo />
            <a href={`mailto:${email}`} className="mt-3 inline-block text-sm text-[var(--text-secondary)] hover:text-cyan" dir="ltr">
              {email}
            </a>
          </div>
          <Link to="/admin" className="text-xs text-[var(--text-muted)] opacity-50 hover:opacity-100 hover:text-cyan">
            {t.admin}
          </Link>
        </div>
        <p className="mt-8 border-t border-[var(--glass-border)] pt-5 text-xs text-[var(--text-muted)]" dir="ltr">
          © {year} {BRAND_NAME}. {t.rights}
        </p>
      </div>
    </footer>
  )
}

export default Footer
