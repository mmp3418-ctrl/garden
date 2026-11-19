import type { FC } from 'react'
import { useLanguage } from '../context/LanguageContext'

const LanguageToggle: FC = () => {
  const { language, toggleLanguage } = useLanguage()

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label="Toggle language"
      className="nav-control touch-target inline-flex h-11 min-w-11 items-center justify-center rounded-xl px-3 font-display text-xs font-bold text-[var(--text-primary)] transition hover:text-cyan"
    >
      {language === 'ar' ? 'EN' : 'ع'}
    </button>
  )
}

export default LanguageToggle
