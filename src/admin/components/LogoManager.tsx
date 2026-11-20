import { Check, ImagePlus, Link2, Loader2, Trash2, UploadCloud } from 'lucide-react'
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FC,
} from 'react'
import { BRAND_NAME } from '../../data/content'
import { deleteMediaByPublicUrl, uploadLogoFile } from '../../lib/storage'
import { supabase } from '../../lib/supabase'
import { normalizeLogoUrl, withCacheBust } from '../../utils/mediaUrl'
import type { AdminDictionary } from '../i18n'
import type { ToastState } from './AdminToast'

const ACCEPTED =
  'image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,.png,.jpg,.jpeg,.webp,.svg'

interface LogoManagerProps {
  dict: AdminDictionary
  rowId: string | number
  logoUrl: string
  onLogoChange: (url: string) => void
  onToast: (toast: ToastState) => void
  onSaved?: () => void
}

async function persistLogoUrl(
  rowId: string | number,
  url: string | null,
): Promise<string | null> {
  const stamp = new Date().toISOString()
  const normalizedId = rowId === 1 || rowId === '1' ? 1 : rowId

  const { error: updateError } = await supabase
    .from('site_settings')
    .update({ logo_url: url, updated_at: stamp })
    .eq('id', rowId)

  if (updateError) {
    const upsert = await supabase.from('site_settings').upsert({
      id: normalizedId,
      logo_url: url,
      updated_at: stamp,
    })
    if (upsert.error) throw new Error(upsert.error.message)
  }

  const { data, error: fetchError } = await supabase
    .from('site_settings')
    .select('logo_url')
    .eq('id', normalizedId)
    .maybeSingle()

  if (fetchError) throw new Error(fetchError.message)

  const stored = (data as { logo_url?: string | null } | null)?.logo_url ?? null
  return stored?.trim() || null
}

const LogoPreview: FC<{
  label: string
  labelClass: string
  bgClass: string
  borderClass: string
  brandClass: string
  logoUrl: string
  bust: number
}> = ({ label, labelClass, bgClass, borderClass, brandClass, logoUrl, bust }) => {
  const src = logoUrl ? withCacheBust(logoUrl, bust) : ''
  return (
    <div className={`rounded-2xl border p-4 ${bgClass} ${borderClass}`}>
      <p className={`mb-3 text-[11px] font-semibold ${labelClass}`}>{label}</p>
      <div className="flex min-h-[4.5rem] items-center gap-3">
        {src ? (
          <img
            key={src}
            src={src}
            alt=""
            className="h-12 w-auto max-w-[140px] object-contain"
          />
        ) : (
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-sm font-extrabold text-white">
            GC
          </span>
        )}
        <span className={`min-w-0 truncate font-display text-sm font-bold ${brandClass}`} dir="ltr">
          {BRAND_NAME}
        </span>
      </div>
    </div>
  )
}

const LogoManager: FC<LogoManagerProps> = ({
  dict,
  rowId,
  logoUrl,
  onLogoChange,
  onToast,
  onSaved,
}) => {
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [manualUrl, setManualUrl] = useState(logoUrl)
  const [bust, setBust] = useState(() => Date.now())
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setManualUrl(logoUrl)
    setBust(Date.now())
  }, [logoUrl])

  const commitStored = (stored: string | null): void => {
    const next = stored ?? ''
    onLogoChange(next)
    setManualUrl(next)
    setBust(Date.now())
  }

  const upload = async (file: File): Promise<void> => {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
    const byExt = /\.(png|jpe?g|webp|svg)$/i.test(file.name)
    if (!allowed.includes(file.type) && !byExt) {
      onToast({ type: 'error', message: dict.error })
      return
    }

    setBusy(true)
    try {
      const previous = logoUrl
      const { publicUrl } = await uploadLogoFile(file)
      const stored = await persistLogoUrl(rowId, publicUrl)
      commitStored(stored ?? publicUrl)
      if (previous && previous !== (stored ?? publicUrl)) {
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
      setBusy(false)
    }
  }

  const handleFile = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) void upload(file)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) void upload(file)
  }

  const handleApplyManualUrl = async (): Promise<void> => {
    const normalized = normalizeLogoUrl(manualUrl)
    setBusy(true)
    try {
      const stored = await persistLogoUrl(rowId, normalized)
      commitStored(stored)
      onToast({ type: 'success', message: dict.saved })
      onSaved?.()
    } catch (err) {
      onToast({ type: 'error', message: err instanceof Error ? err.message : dict.error })
    } finally {
      setBusy(false)
    }
  }

  const handleRemove = async (): Promise<void> => {
    if (!logoUrl && !manualUrl.trim()) return
    if (!window.confirm(dict.confirmDelete)) return
    setBusy(true)
    try {
      const previous = logoUrl
      const stored = await persistLogoUrl(rowId, null)
      commitStored(stored)
      if (previous) {
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
      setBusy(false)
    }
  }

  return (
    <section className="glass space-y-4 rounded-2xl p-4 sm:p-6">
      <div>
        <h3 className="text-sm font-bold text-[var(--text-primary)]">{dict.websiteLogo}</h3>
        <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{dict.logoHint}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <LogoPreview
          label={dict.logoDarkPreview}
          labelClass="text-cyan"
          bgClass="bg-[#0B192C]"
          borderClass="border-white/10"
          brandClass="text-white"
          logoUrl={logoUrl || manualUrl}
          bust={bust}
        />
        <LogoPreview
          label={dict.logoLightPreview}
          labelClass="text-[#0078D7]"
          bgClass="bg-[#F8FAFC]"
          borderClass="border-slate-200"
          brandClass="text-[#0B192C]"
          logoUrl={logoUrl || manualUrl}
          bust={bust}
        />
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition ${
          dragging ? 'border-cyan bg-cyan/10' : 'border-[var(--glass-border)]'
        }`}
      >
        {busy ? (
          <Loader2 className="animate-spin text-cyan" size={26} />
        ) : (
          <UploadCloud className="text-cyan" size={26} />
        )}
        <p className="text-xs text-[var(--text-secondary)]">
          {busy ? dict.logoUploading : dict.dropHint}
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-brand-gradient px-4 text-sm font-bold text-white disabled:opacity-70"
        >
          <ImagePlus size={15} />
          {busy ? dict.uploading : dict.upload}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          disabled={busy}
          onChange={handleFile}
        />
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
          <Link2 size={14} />
          {dict.logoUrlLabel}
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={manualUrl}
            onChange={(e) => {
              setManualUrl(e.target.value)
              setBust(Date.now())
            }}
            placeholder={dict.logoUrlPlaceholder}
            dir="ltr"
            disabled={busy}
            className="min-h-[44px] w-full flex-1 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-sm outline-none focus:border-[var(--glass-border-hover)] focus:ring-2 focus:ring-[#00A9FF]/20 disabled:opacity-60"
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleApplyManualUrl()}
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl border border-cyan/40 bg-cyan/10 px-4 text-sm font-bold text-cyan disabled:opacity-70"
          >
            <Check size={15} />
            {dict.applyLogoUrl}
          </button>
        </div>
        <p className="text-[11px] text-[var(--text-muted)]">{dict.logoUrlHint}</p>
      </div>

      {(logoUrl || manualUrl.trim()) ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleRemove()}
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-3 text-sm font-semibold text-red-400 disabled:opacity-70 sm:w-auto"
        >
          <Trash2 size={14} />
          {dict.removeLogo}
        </button>
      ) : null}
    </section>
  )
}

export default LogoManager
