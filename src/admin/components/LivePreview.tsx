import { Building2 } from 'lucide-react'
import type { FC } from 'react'
import ServiceIcon from '../../components/ServiceIcon'
import { BRAND_NAME } from '../../data/content'
import type { ServiceRow } from '../../types'
import type { AdminDictionary } from '../i18n'

export interface PreviewContent {
  hero_title_ar: string
  hero_title_en: string
  hero_subtitle_ar: string
  hero_subtitle_en: string
  main_heading_ar: string
  main_heading_en: string
  complex_overview_ar: string
  complex_overview_en: string
  facilities_heading_ar: string
  facilities_heading_en: string
  facilities_intro_ar: string
  facilities_intro_en: string
  hero_image_url: string
}

interface LivePreviewProps {
  dict: AdminDictionary
  content: PreviewContent
  previewLang: 'ar' | 'en'
  onPreviewLangChange: (lang: 'ar' | 'en') => void
  services?: Array<Pick<ServiceRow, 'id' | 'title_ar' | 'title_en' | 'description_ar' | 'description_en' | 'icon_name' | 'sort_order'>>
}

const LivePreview: FC<LivePreviewProps> = ({
  dict,
  content,
  previewLang,
  onPreviewLangChange,
  services = [],
}) => {
  const isAr = previewLang === 'ar'
  const pick = (ar: string, en: string): string => (isAr ? ar : en) || (isAr ? en : ar)

  const heroTitle = pick(content.hero_title_ar, content.hero_title_en)
  const heroSubtitle = pick(content.hero_subtitle_ar, content.hero_subtitle_en)
  const mainHeading = pick(content.main_heading_ar, content.main_heading_en)
  const overview = pick(content.complex_overview_ar, content.complex_overview_en)
  const facilitiesHeading = pick(content.facilities_heading_ar, content.facilities_heading_en)
  const facilitiesIntro = pick(content.facilities_intro_ar, content.facilities_intro_en)

  const sorted = [...services].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className="glass sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-2xl p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-cyan">{dict.livePreview}</h3>
        <div className="flex gap-1 rounded-xl border border-[var(--glass-border)] p-1">
          <button
            type="button"
            onClick={() => onPreviewLangChange('ar')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
              isAr ? 'bg-brand-gradient text-white' : 'text-[var(--text-muted)]'
            }`}
          >
            {dict.previewLangAr}
          </button>
          <button
            type="button"
            onClick={() => onPreviewLangChange('en')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
              !isAr ? 'bg-brand-gradient text-white' : 'text-[var(--text-muted)]'
            }`}
          >
            {dict.previewLangEn}
          </button>
        </div>
      </div>

      <div dir={isAr ? 'rtl' : 'ltr'} className="space-y-4 text-start">
        <div className="relative overflow-hidden rounded-2xl bg-navy">
          {content.hero_image_url ? (
            <img src={content.hero_image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(0,169,255,0.35),transparent_45%)]" />
          )}
          <div className="relative space-y-2 p-5">
            <p className="font-display text-[11px] font-semibold text-cyan" dir="ltr">
              {BRAND_NAME}
            </p>
            <h4 className="text-base font-extrabold leading-snug text-white sm:text-lg">
              {heroTitle || '—'}
            </h4>
            <p className="text-xs leading-6 text-white/75">{heroSubtitle || '—'}</p>
          </div>
        </div>

        <article className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
          <div className="mb-3 inline-flex rounded-xl bg-brand-gradient p-2 text-white">
            <Building2 size={14} />
          </div>
          <p className="mb-1 font-display text-[11px] font-semibold text-cyan" dir="ltr">
            {BRAND_NAME}
          </p>
          <h4 className="text-sm font-extrabold text-[var(--text-primary)]">{mainHeading || '—'}</h4>
          <p className="mt-2 text-xs leading-6 text-[var(--text-secondary)]">{overview || '—'}</p>
        </article>

        <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
          <h4 className="text-center text-sm font-extrabold text-[var(--text-primary)]">
            {facilitiesHeading || '—'}
          </h4>
          <p className="mt-2 text-center text-xs leading-6 text-[var(--text-secondary)]">
            {facilitiesIntro || '—'}
          </p>
          <ul className="mt-4 space-y-2">
            {sorted.length === 0 ? (
              <li className="rounded-xl border border-dashed border-[var(--glass-border)] px-3 py-4 text-center text-xs text-[var(--text-muted)]">
                —
              </li>
            ) : (
              sorted.map((service, index) => (
                <li key={service.id} className="rounded-xl border border-[var(--glass-border)] p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="inline-flex rounded-lg bg-brand-gradient p-1.5 text-white">
                      <ServiceIcon name={service.icon_name} className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-[11px] font-bold text-cyan">{index + 1}</span>
                  </div>
                  <p className="text-xs font-bold text-[var(--text-primary)]">
                    {pick(service.title_ar, service.title_en) || '—'}
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-[var(--text-secondary)]">
                    {pick(service.description_ar ?? '', service.description_en ?? '') || '—'}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default LivePreview
