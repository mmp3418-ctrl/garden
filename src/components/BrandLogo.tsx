import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { useSite } from '../context/SiteDataContext'
import { BRAND_NAME } from '../data/content'

interface BrandLogoProps {
  to?: string
  compact?: boolean
}

const BrandLogo: FC<BrandLogoProps> = ({ to = '/', compact = false }) => {
  const { settings } = useSite()
  const logoUrl = settings.logo_url?.trim() || null

  return (
    <Link to={to} className="inline-flex min-w-0 items-center gap-2.5" aria-label={BRAND_NAME}>
      {logoUrl ? (
        <img
          src={logoUrl}
          alt=""
          className={`w-auto object-contain ${compact ? 'h-8' : 'h-9 sm:h-10'} max-w-[120px]`}
        />
      ) : (
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-sm font-extrabold text-white">
          GC
        </span>
      )}
      <span
        className="truncate font-display text-sm font-bold tracking-wide text-[var(--text-primary)] sm:text-base"
        dir="ltr"
      >
        {BRAND_NAME}
      </span>
    </Link>
  )
}

export default BrandLogo
