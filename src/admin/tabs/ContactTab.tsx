import { useEffect, useState, type FC, type FormEvent } from 'react'
import { defaultSettings } from '../../data/defaults'
import { supabase } from '../../lib/supabase'
import type { SiteSettings } from '../../types'
import { toMapEmbedUrl } from '../../utils/map'
import { mergeSettings } from '../../utils/siteSettings'
import { AdminInput, AdminTextarea } from '../components/AdminField'
import type { ToastState } from '../components/AdminToast'
import type { AdminDictionary } from '../i18n'

interface Props {
  dict: AdminDictionary
  onToast: (toast: ToastState) => void
  onSaved?: () => void
}

type ContactForm = {
  phone: string
  whatsapp: string
  email: string
  address_ar: string
  address_en: string
  map_url: string
}

function toForm(settings: SiteSettings): ContactForm {
  return {
    phone: settings.phone ?? '',
    whatsapp: settings.whatsapp ?? '',
    email: settings.email ?? '',
    address_ar: settings.address_ar ?? '',
    address_en: settings.address_en ?? '',
    map_url: settings.map_url ?? '',
  }
}

const ContactTab: FC<Props> = ({ dict, onToast, onSaved }) => {
  const [rowId, setRowId] = useState<string | number>(1)
  const [form, setForm] = useState<ContactForm>(toForm(defaultSettings))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = async (): Promise<void> => {
    setLoading(true)
    let settingsRow: SiteSettings | null = null
    const byId = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle()
    if (!byId.error && byId.data) {
      settingsRow = byId.data as SiteSettings
    } else {
      const fallback = await supabase
        .from('site_settings')
        .select('*')
        .order('id', { ascending: true })
        .limit(1)
        .maybeSingle()
      if (fallback.error) onToast({ type: 'error', message: fallback.error.message || dict.error })
      else if (fallback.data) settingsRow = fallback.data as SiteSettings
    }

    if (settingsRow) {
      const merged = mergeSettings(settingsRow)
      setForm(toForm(merged))
      setRowId(merged.id)
    }
    setLoading(false)
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSave = async (event: FormEvent): Promise<void> => {
    event.preventDefault()
    setSaving(true)
    try {
      const payload = {
        phone: form.phone.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        email: form.email.trim() || null,
        address_ar: form.address_ar.trim() || null,
        address_en: form.address_en.trim() || null,
        map_url: form.map_url.trim() || null,
        updated_at: new Date().toISOString(),
      }
      let { error } = await supabase.from('site_settings').update(payload).eq('id', rowId)
      if (error) {
        const upsert = await supabase
          .from('site_settings')
          .upsert({ id: rowId === 1 || rowId === '1' ? 1 : rowId, ...payload })
        error = upsert.error
      }
      if (error) throw new Error(error.message)
      onToast({ type: 'success', message: dict.saved })
      onSaved?.()
      await load()
    } catch (err) {
      onToast({ type: 'error', message: err instanceof Error ? err.message : dict.error })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-sm text-[var(--text-muted)]">{dict.loading}</p>

  const embed = toMapEmbedUrl(form.map_url)

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => void handleSave(e)} className="glass rounded-2xl p-5 sm:p-6">
        <h3 className="mb-4 text-base font-bold">{dict.tabs.contact}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <AdminInput label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} dir="ltr" />
          <AdminInput label="WhatsApp" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} dir="ltr" />
          <AdminInput label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} dir="ltr" />
          <AdminInput label="Map URL" value={form.map_url} onChange={(e) => setForm({ ...form, map_url: e.target.value })} dir="ltr" />
          <AdminTextarea label="Address (AR)" value={form.address_ar} onChange={(e) => setForm({ ...form, address_ar: e.target.value })} dir="rtl" />
          <AdminTextarea label="Address (EN)" value={form.address_en} onChange={(e) => setForm({ ...form, address_en: e.target.value })} dir="ltr" />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-gradient px-5 text-sm font-bold text-white disabled:opacity-70"
        >
          {saving ? dict.saving : dict.save}
        </button>
      </form>

      <section className="glass overflow-hidden rounded-2xl">
        <div className="border-b border-[var(--glass-border)] px-4 py-3 sm:px-5">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">{dict.mapPreview}</h3>
        </div>
        <div className="relative aspect-[16/11] w-full bg-[var(--bg-deep)] sm:aspect-[16/9]">
          <iframe
            title={dict.mapPreview}
            src={embed}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </section>
    </div>
  )
}

export default ContactTab
