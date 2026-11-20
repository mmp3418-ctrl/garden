import { Building2, Clock3, Image as ImageIcon, MailWarning, Sparkles } from 'lucide-react'
import type { FC } from 'react'
import type { AdminDictionary } from '../i18n'

interface StatsCardsProps {
  dict: AdminDictionary
  facilities: number
  services: number
  gallery: number
  unread: number
  lastUpdated: string | null
  language: 'ar' | 'en'
}

const StatsCards: FC<StatsCardsProps> = ({
  dict,
  facilities,
  services,
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
    { label: dict.stats.services, value: String(services), icon: Sparkles },
    { label: dict.stats.gallery, value: String(gallery), icon: ImageIcon },
    { label: dict.stats.unread, value: String(unread), icon: MailWarning },
    { label: dict.stats.updated, value: updatedLabel, icon: Clock3 },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {cards.map(({ label, value, icon: Icon }) => (
        <article key={label} className="glass rounded-2xl p-4 sm:p-5">
          <div className="mb-3 inline-flex rounded-xl bg-brand-gradient p-2.5 text-white">
            <Icon size={16} />
          </div>
          <p className="text-xs font-semibold text-[var(--text-muted)]">{label}</p>
          <p className="mt-1 truncate text-lg font-extrabold text-[var(--text-primary)] sm:text-xl">
            {value}
          </p>
        </article>
      ))}
    </div>
  )
}

export default StatsCards
