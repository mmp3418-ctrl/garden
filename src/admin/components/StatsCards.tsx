import { Building2, Clock3, Image as ImageIcon, MailWarning } from 'lucide-react'
import type { FC } from 'react'
import type { AdminDictionary } from '../i18n'

interface StatsCardsProps {
  dict: AdminDictionary
  facilities: number
  gallery: number
  unread: number
  lastUpdated: string | null
  language: 'ar' | 'en'
}

const StatsCards: FC<StatsCardsProps> = ({
  dict,
  facilities,
  gallery,
  unread,
  lastUpdated,
  language,
}) => {
  const updatedLabel = lastUpdated
    ? new Date(lastUpdated).toLocaleString(language === 'ar' ? 'ar-LY' : 'en-GB')
    : '—'

  const cards = [
    { label: dict.stats.facilities, value: String(facilities), icon: Building2 },
    { label: dict.stats.gallery, value: String(gallery), icon: ImageIcon },
    { label: dict.stats.unread, value: String(unread), icon: MailWarning },
    { label: dict.stats.updated, value: updatedLabel, icon: Clock3 },
  ]

  return (
    <div className="mb-5 grid grid-cols-2 gap-2.5 sm:mb-6 sm:gap-3 xl:grid-cols-4">
      {cards.map(({ label, value, icon: Icon }) => (
        <article key={label} className="glass rounded-2xl p-3.5 sm:p-5">
          <div className="mb-2 inline-flex rounded-xl bg-brand-gradient p-2 text-white sm:mb-3 sm:p-2.5">
            <Icon size={15} />
          </div>
          <p className="text-[10px] font-semibold leading-4 text-[var(--text-muted)] sm:text-xs">
            {label}
          </p>
          <p className="mt-1 truncate text-base font-extrabold text-[var(--text-primary)] sm:text-xl">
            {value}
          </p>
        </article>
      ))}
    </div>
  )
}

export default StatsCards
