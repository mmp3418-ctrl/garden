import { Eye, EyeOff, ImagePlus, RotateCcw, Trash2, UploadCloud } from 'lucide-react'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FC,
  type FormEvent,
  type ReactNode,
} from 'react'
import { officialSettingsDefaults, OFFICIAL_TEXT, type OfficialTextKey } from '../../data/officialContent'
import { deleteMediaByPublicUrl, uploadMediaFile } from '../../lib/storage'
import { supabase } from '../../lib/supabase'
import type { ServiceRow, SiteSettings } from '../../types'
import { withCacheBust } from '../../utils/mediaUrl'
import { mergeSettings } from '../../utils/siteSettings'
import { AdminTextarea } from '../components/AdminField'
import type { ToastState } from '../components/AdminToast'
import LivePreview, { type PreviewContent } from '../components/LivePreview'
import LogoManager from '../components/LogoManager'
import type { AdminDictionary } from '../i18n'

interface Props {
  dict: AdminDictionary
  onToast: (toast: ToastState) => void
  onSaved?: () => void
}

type FormState = PreviewContent & { logo_url: string }
type TextFieldKey = Exclude<keyof FormState, 'hero_image_url' | 'logo_url'>

function toForm(settings: SiteSettings): FormState {
  return {
    hero_title_ar: settings.hero_title_ar ?? '',
    hero_title_en: settings.hero_title_en ?? '',
    hero_subtitle_ar: settings.hero_subtitle_ar ?? '',
    hero_subtitle_en: settings.hero_subtitle_en ?? '',
    main_heading_ar: settings.main_heading_ar ?? '',
    main_heading_en: settings.main_heading_en ?? '',
    complex_overview_ar: settings.complex_overview_ar ?? '',
    complex_overview_en: settings.complex_overview_en ?? '',
    facilities_heading_ar: settings.facilities_heading_ar ?? '',
    facilities_heading_en: settings.facilities_heading_en ?? '',
    facilities_intro_ar: settings.facilities_intro_ar ?? '',
    facilities_intro_en: settings.facilities_intro_en ?? '',
    hero_image_url: settings.hero_image_url ?? '',
    logo_url: settings.logo_url ?? '',
  }
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="glass space-y-5 rounded-2xl p-5 sm:p-6">
      <h3 className="text-base font-bold text-[var(--text-primary)]">{title}</h3>
      {children}
    </section>
  )
}

function BilingualField({
  dict,
  label,
  valueAr,
  valueEn,
  onChangeAr,
  onChangeEn,
  onRestore,
  rows = 3,
}: {
  dict: AdminDictionary
  label: string
  valueAr: string
  valueEn: string
  onChangeAr: (v: string) => void
  onChangeEn: (v: string) => void
  onRestore: () => void
  rows?: number
}) {
  return (
    <div className="space-y-3 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-elevated)]/25 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-cyan">{label}</p>
        <button
          type="button"
          onClick={onRestore}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[var(--glass-border)] px-2.5 text-xs font-semibold text-[var(--text-muted)] hover:text-cyan"
        >
          <RotateCcw size={12} />
          {dict.restoreDefault}
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <AdminTextarea
            label="العربية / AR"
            value={valueAr}
            onChange={(e) => onChangeAr(e.target.value)}
            dir="rtl"
            rows={rows}
          />
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {valueAr.length} {dict.chars}
          </p>
        </div>
        <div>
          <AdminTextarea
            label="English / EN"
            value={valueEn}
            onChange={(e) => onChangeEn(e.target.value)}
            dir="ltr"
            rows={rows}
          />
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {valueEn.length} {dict.chars}
          </p>
        </div>
      </div>
    </div>
  )
}

const SiteSettingsTab: FC<Props> = ({ dict, onToast, onSaved }) => {
  const [rowId, setRowId] = useState<string | number>(1)
  const [form, setForm] = useState<FormState>(toForm(officialSettingsDefaults))
  const [baseline, setBaseline] = useState<FormState>(toForm(officialSettingsDefaults))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [previewLang, setPreviewLang] = useState<'ar' | 'en'>('ar')
  const [previewServices, setPreviewServices] = useState<ServiceRow[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(baseline), [form, baseline])

  const load = async (): Promise<void> => {
    setLoading(true)
    const [settingsRes, servicesRes] = await Promise.all([
      supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
      supabase.from('services').select('*').order('sort_order', { ascending: true }),
    ])

    if (settingsRes.error) {
      onToast({ type: 'error', message: settingsRes.error.message || dict.error })
    }

    let row: SiteSettings | null = null
    if (!settingsRes.error && settingsRes.data) {
      row = settingsRes.data as SiteSettings
    } else {
      const fallback = await supabase
        .from('site_settings')
        .select('*')
        .order('id', { ascending: true })
        .limit(1)
        .maybeSingle()
      if (fallback.data) row = fallback.data as SiteSettings
    }

    const next = toForm(row ? mergeSettings(row) : officialSettingsDefaults)
    setForm(next)
    setBaseline(next)
    if (row) setRowId(row.id)
    setPreviewServices((servicesRes.data as ServiceRow[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setField = (key: TextFieldKey, value: string): void => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const restorePair = (arKey: OfficialTextKey, enKey: OfficialTextKey): void => {
    setForm((prev) => ({
      ...prev,
      [arKey]: OFFICIAL_TEXT[arKey],
      [enKey]: OFFICIAL_TEXT[enKey],
    }))
    onToast({ type: 'success', message: dict.restored })
  }

  const persistHeroUrl = async (url: string | null): Promise<void> => {
    const { error } = await supabase
      .from('site_settings')
      .update({ hero_image_url: url, updated_at: new Date().toISOString() })
      .eq('id', rowId)
    if (error) throw new Error(error.message)
  }

  const uploadHero = async (file: File): Promise<void> => {
    if (!file.type.startsWith('image/')) return
    setUploading(true)
    try {
      const previous = form.hero_image_url
      const { publicUrl } = await uploadMediaFile('hero', file)
      setForm((prev) => ({ ...prev, hero_image_url: publicUrl }))
      await persistHeroUrl(publicUrl)
      setBaseline((prev) => ({ ...prev, hero_image_url: publicUrl }))
      if (previous && previous !== publicUrl) {
        try {
          await deleteMediaByPublicUrl(previous)
        } catch {
          /* best-effort */
        }
      }
      onToast({ type: 'success', message: dict.saved })
      onSaved?.()
    } catch (err) {
      onToast({ type: 'error', message: err instanceof Error ? err.message : dict.error })
    } finally {
      setUploading(false)
    }
  }

  const handleUpload = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) void uploadHero(file)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) void uploadHero(file)
  }

  const handleRemoveHero = async (): Promise<void> => {
    if (!form.hero_image_url) return
    setUploading(true)
    try {
      const previous = form.hero_image_url
      await persistHeroUrl(null)
      setForm((prev) => ({ ...prev, hero_image_url: '' }))
      setBaseline((prev) => ({ ...prev, hero_image_url: '' }))
      try {
        await deleteMediaByPublicUrl(previous)
      } catch {
        /* best-effort */
      }
      onToast({ type: 'success', message: dict.saved })
      onSaved?.()
    } catch (err) {
      onToast({ type: 'error', message: err instanceof Error ? err.message : dict.error })
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (event?: FormEvent): Promise<void> => {
    event?.preventDefault()
    setSaving(true)
    try {
      const payload = {
        hero_title_ar: form.hero_title_ar.trim() || null,
        hero_title_en: form.hero_title_en.trim() || null,
        hero_subtitle_ar: form.hero_subtitle_ar.trim() || null,
        hero_subtitle_en: form.hero_subtitle_en.trim() || null,
        main_heading_ar: form.main_heading_ar.trim() || null,
        main_heading_en: form.main_heading_en.trim() || null,
        complex_overview_ar: form.complex_overview_ar.trim() || null,
        complex_overview_en: form.complex_overview_en.trim() || null,
        facilities_heading_ar: form.facilities_heading_ar.trim() || null,
        facilities_heading_en: form.facilities_heading_en.trim() || null,
        facilities_intro_ar: form.facilities_intro_ar.trim() || null,
        facilities_intro_en: form.facilities_intro_en.trim() || null,
        about_ar: form.complex_overview_ar.trim() || null,
        about_en: form.complex_overview_en.trim() || null,
        vision_ar: form.facilities_heading_ar.trim() || null,
        vision_en: form.facilities_heading_en.trim() || null,
        mission_ar: form.facilities_intro_ar.trim() || null,
        mission_en: form.facilities_intro_en.trim() || null,
        hero_image_url: form.hero_image_url.trim() || null,
        logo_url: form.logo_url.trim() || null,
        updated_at: new Date().toISOString(),
      }

      const normalizedId = rowId === 1 || rowId === '1' ? 1 : rowId
      let { error } = await supabase.from('site_settings').update(payload).eq('id', rowId)
      if (error) {
        const upsert = await supabase.from('site_settings').upsert({ id: normalizedId, ...payload })
        error = upsert.error
      }
      if (error) throw new Error(error.message)

      const { data: fresh, error: refetchError } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', normalizedId)
        .maybeSingle()
      if (refetchError) throw new Error(refetchError.message)

      const synced = toForm(
        mergeSettings(
          (fresh as SiteSettings | null) ?? {
            ...officialSettingsDefaults,
            ...payload,
            id: normalizedId,
          },
        ),
      )
      setForm(synced)
      setBaseline(synced)
      onToast({ type: 'success', message: dict.saved })
      onSaved?.()
    } catch (err) {
      onToast({ type: 'error', message: err instanceof Error ? err.message : dict.error })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-cyan border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="relative space-y-5 pb-28">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {dirty ? (
            <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-300">
              {dict.unsaved}
            </span>
          ) : null}
          <p className="text-sm text-[var(--text-muted)]">{dict.bilingualHint}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[var(--glass-border)] px-3 text-sm font-semibold"
          >
            {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
            {showPreview ? dict.hidePreview : dict.showPreview}
          </button>
          <button
            type="button"
            disabled={saving || !dirty}
            onClick={() => void handleSave()}
            className="hidden min-h-[44px] items-center justify-center rounded-xl bg-brand-gradient px-5 text-sm font-bold text-white disabled:opacity-50 lg:inline-flex"
          >
            {saving ? dict.saving : dict.save}
          </button>
        </div>
      </div>

      <div className={`grid gap-5 ${showPreview ? 'xl:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]' : ''}`}>
        <div className="space-y-5">
          <LogoManager
            dict={dict}
            rowId={rowId}
            logoUrl={form.logo_url}
            onLogoChange={(url) => {
              setForm((prev) => ({ ...prev, logo_url: url }))
              setBaseline((prev) => ({ ...prev, logo_url: url }))
            }}
            onToast={onToast}
            onSaved={onSaved}
          />

          <SectionCard title={dict.sectionHero}>
            <div className="mb-2 grid gap-4 lg:grid-cols-2">
              <div className="overflow-hidden rounded-xl border border-[var(--glass-border)] bg-[var(--bg-deep)]">
                {form.hero_image_url ? (
                  <img
                    src={withCacheBust(form.hero_image_url)}
                    alt={dict.heroPreview}
                    className="aspect-[16/9] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[16/9] items-center justify-center text-sm text-[var(--text-muted)]">
                    {dict.heroPreview}
                  </div>
                )}
              </div>
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-8 text-center ${
                  dragging ? 'border-cyan bg-cyan/10' : 'border-[var(--glass-border)]'
                }`}
              >
                <UploadCloud className="text-cyan" size={24} />
                <p className="text-sm text-[var(--text-secondary)]">{dict.dropHint}</p>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-brand-gradient px-4 text-sm font-bold text-white disabled:opacity-70"
                >
                  <ImagePlus size={15} />
                  {uploading ? dict.uploading : dict.upload}
                </button>
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                {form.hero_image_url ? (
                  <button
                    type="button"
                    onClick={() => void handleRemoveHero()}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-3 text-sm font-semibold text-red-400"
                  >
                    <Trash2 size={14} />
                    {dict.remove}
                  </button>
                ) : null}
              </div>
            </div>

            <div className="space-y-4">
              <BilingualField
                dict={dict}
                label="Hero Title"
                valueAr={form.hero_title_ar}
                valueEn={form.hero_title_en}
                onChangeAr={(v) => setField('hero_title_ar', v)}
                onChangeEn={(v) => setField('hero_title_en', v)}
                onRestore={() => restorePair('hero_title_ar', 'hero_title_en')}
              />
              <BilingualField
                dict={dict}
                label="Hero Subtitle"
                valueAr={form.hero_subtitle_ar}
                valueEn={form.hero_subtitle_en}
                onChangeAr={(v) => setField('hero_subtitle_ar', v)}
                onChangeEn={(v) => setField('hero_subtitle_en', v)}
                onRestore={() => restorePair('hero_subtitle_ar', 'hero_subtitle_en')}
                rows={4}
              />
            </div>
          </SectionCard>

          <SectionCard title={dict.sectionOverview}>
            <div className="space-y-4">
              <BilingualField
                dict={dict}
                label="Main Heading"
                valueAr={form.main_heading_ar}
                valueEn={form.main_heading_en}
                onChangeAr={(v) => setField('main_heading_ar', v)}
                onChangeEn={(v) => setField('main_heading_en', v)}
                onRestore={() => restorePair('main_heading_ar', 'main_heading_en')}
              />
              <BilingualField
                dict={dict}
                label="Complex Overview"
                valueAr={form.complex_overview_ar}
                valueEn={form.complex_overview_en}
                onChangeAr={(v) => setField('complex_overview_ar', v)}
                onChangeEn={(v) => setField('complex_overview_en', v)}
                onRestore={() => restorePair('complex_overview_ar', 'complex_overview_en')}
                rows={5}
              />
            </div>
          </SectionCard>

          <SectionCard title={dict.sectionFacilities}>
            <div className="space-y-4">
              <BilingualField
                dict={dict}
                label="Facilities Heading"
                valueAr={form.facilities_heading_ar}
                valueEn={form.facilities_heading_en}
                onChangeAr={(v) => setField('facilities_heading_ar', v)}
                onChangeEn={(v) => setField('facilities_heading_en', v)}
                onRestore={() => restorePair('facilities_heading_ar', 'facilities_heading_en')}
              />
              <BilingualField
                dict={dict}
                label="Facilities Intro"
                valueAr={form.facilities_intro_ar}
                valueEn={form.facilities_intro_en}
                onChangeAr={(v) => setField('facilities_intro_ar', v)}
                onChangeEn={(v) => setField('facilities_intro_en', v)}
                onRestore={() => restorePair('facilities_intro_ar', 'facilities_intro_en')}
                rows={4}
              />
            </div>
          </SectionCard>
        </div>

        {showPreview ? (
          <div className="xl:sticky xl:top-6 xl:self-start">
            <LivePreview
              dict={dict}
              content={form}
              previewLang={previewLang}
              onPreviewLangChange={setPreviewLang}
              services={previewServices}
            />
          </div>
        ) : null}
      </div>

      {/* Mobile sticky save */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--glass-border)] bg-[var(--nav-bg)]/95 px-4 py-3 backdrop-blur-xl lg:hidden" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <button
          type="button"
          disabled={saving || !dirty}
          onClick={() => void handleSave()}
          className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-brand-gradient text-base font-bold text-white disabled:opacity-50"
        >
          {saving ? dict.saving : dict.save}
        </button>
      </div>
    </div>
  )
}

export default SiteSettingsTab
