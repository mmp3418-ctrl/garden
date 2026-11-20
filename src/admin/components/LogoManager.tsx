import { ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent, type FC } from 'react'
import { BRAND_NAME } from '../../data/content'
import { deleteMediaByPublicUrl, uploadLogoFile } from '../../lib/storage'
import { supabase } from '../../lib/supabase'
import { withCacheBust } from '../../utils/mediaUrl'
import type { AdminDictionary } from '../i18n'
import type { ToastState } from './AdminToast'

const ACCEPTED = 'image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,.png,.jpg,.jpeg,.webp,.svg'

interface LogoManagerProps {
  dict: AdminDictionary
  rowId: string | number
  logoUrl: string
  onLogoChange: (url: string) => void
  onToast: (toast: ToastState) => void
  onSaved?: () => void
}

async function persistLogoUrl(rowId: string | number, url: string | null): Promise<string | null> {
  const stamp = new Date().toISOString()
  const id = rowId === 1 || rowId === '1' ? 1 : rowId

  const { error: updateError } = await supabase
    .from('site_settings')
    .update({ logo_url: url, updated_at: stamp })
    .eq('id', rowId)

  if (updateError) {
    const upsert = await supabase.from('site_settings').upsert({
      id,
      logo_url: url,
      updated_at: stamp,
    })
    if (upsert.error) throw new Error(upsert.error.message)
  }

  const { data, error } = await supabase
    .from('site_settings')
    .select('logo_url')
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return (data as { logo_url?: string | null } | null)?.logo_url?.trim() || null
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
  const [bust, setBust] = useState(() => Date.now())
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setBust(Date.now())
  }, [logoUrl])

  const previewSrc = logoUrl ? withCacheBust(logoUrl, bust) : ''

  const upload = async (file: File): Promise<void> => {
    if (!file.type.startsWith('image/') && !/\.(png|jpe?g|webp|svg)$/i.test(file.name)) {
      onToast({ type: 'error', message: dict.error })
      return
    }

    setBusy(true)
    try {
      const previous = logoUrl
      const { publicUrl } = await uploadLogoFile(file)
      const stored = await persistLogoUrl(rowId, publicUrl)
      const next = stored ?? publicUrl
      onLogoChange(next)
      setBust(Date.now())
      if (previous && previous !== next) {
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

  const handleRemove = async (): Promise<void> => {
    if (!logoUrl) return
    if (!window.confirm(dict.confirmDelete)) return
    setBusy(true)
    try {
      const previous = logoUrl
      await persistLogoUrl(rowId, null)
      onLogoChange('')
      setBust(Date.now())
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
      setBusy(false)
    }
  }

  return (
    <section className="glass space-y-5 rounded-2xl p-5 sm:p-6">
      <div>
        <h3 className="text-base font-bold text-[var(--text-primary)]">{dict.websiteLogo}</h3>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{dict.logoHint}</p>
      </div>

      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <div className="flex min-h-[5.5rem] w-full max-w-xs items-center gap-3 rounded-2xl border border-[var(--glass-border)] bg-[#0B192C] px-4 py-3 sm:w-auto">
          {previewSrc ? (
            <img
              key={previewSrc}
              src={previewSrc}
              alt=""
              className="h-14 w-auto max-w-[160px] object-contain"
            />
          ) : (
            <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-base font-extrabold text-white">
              GC
            </span>
          )}
          <span className="min-w-0 truncate font-display text-sm font-bold text-white" dir="ltr">
            {BRAND_NAME}
          </span>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 text-sm font-bold text-white disabled:opacity-70"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
            {busy ? dict.logoUploading : dict.upload}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            className="hidden"
            disabled={busy}
            onChange={handleFile}
          />
          {logoUrl ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleRemove()}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-5 text-sm font-semibold text-red-400 disabled:opacity-70"
            >
              <Trash2 size={15} />
              {dict.removeLogo}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default LogoManager
